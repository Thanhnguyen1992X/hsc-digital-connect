export interface Employee {
  id: string;
  full_name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  phone_ext?: string;
  avatar_url?: string;
  company_name: string;
  company_logo_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  zalo_phone?: string;
  website_url?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const mockEmployees: Employee[] = [
  {
    id: "123",
    full_name: "Nguyễn Văn A",
    position: "Giám đốc Kinh doanh",
    department: "Phòng Kinh Doanh",
    email: "nguyenvana@hsc.com.vn",
    phone: "+84 28 1234 5678",
    phone_ext: "101",
    company_name: "HSC",
    linkedin_url: "https://linkedin.com/in/nguyenvana",
    facebook_url: "https://facebook.com/nguyenvana",
    zalo_phone: "0901234567",
    website_url: "https://hsc.com.vn",
    address: "Tầng 5, Tòa nhà AB, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "456",
    full_name: "Trần Thị B",
    position: "Kế toán trưởng",
    department: "Phòng Tài Chính",
    email: "tranthib@hsc.com.vn",
    phone: "+84 28 1234 5679",
    phone_ext: "202",
    company_name: "HSC",
    linkedin_url: "https://linkedin.com/in/tranthib",
    zalo_phone: "0912345678",
    website_url: "https://hsc.com.vn",
    address: "Tầng 5, Tòa nhà AB, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "001",
    full_name: "Lê Minh C",
    position: "Giám đốc điều hành",
    department: "Ban Giám Đốc",
    email: "leminhc@hsc.com.vn",
    phone: "+84 28 1234 5680",
    phone_ext: "100",
    company_name: "HSC",
    linkedin_url: "https://linkedin.com/in/leminhc",
    facebook_url: "https://facebook.com/leminhc",
    zalo_phone: "0923456789",
    website_url: "https://hsc.com.vn",
    address: "Tầng 5, Tòa nhà AB, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

export const getEmployeeById = (id: string): Employee | undefined => {
  return mockEmployees.find((e) => e.id === id && e.is_active);
};
