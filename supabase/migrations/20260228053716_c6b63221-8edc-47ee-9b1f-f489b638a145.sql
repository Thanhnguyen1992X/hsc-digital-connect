
-- Create employees table
CREATE TABLE public.employees (
  id VARCHAR PRIMARY KEY,
  full_name VARCHAR NOT NULL,
  position VARCHAR NOT NULL,
  department VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  phone_ext VARCHAR,
  avatar_url TEXT,
  company_name VARCHAR NOT NULL DEFAULT 'HSC',
  company_logo_url TEXT,
  linkedin_url VARCHAR,
  facebook_url VARCHAR,
  zalo_phone VARCHAR,
  website_url VARCHAR,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create card_views table for analytics
CREATE TABLE public.card_views (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source VARCHAR NOT NULL DEFAULT 'direct',
  ip_address VARCHAR,
  user_agent TEXT
);

-- Create app_role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Employees: public read for active employees, admin write
CREATE POLICY "Public can view active employees"
ON public.employees FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can do everything on employees"
ON public.employees FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Card views: anyone can insert (tracking), admins can read
CREATE POLICY "Anyone can insert card views"
ON public.card_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view card analytics"
ON public.card_views FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles: only admins can view
CREATE POLICY "Admins can view roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
