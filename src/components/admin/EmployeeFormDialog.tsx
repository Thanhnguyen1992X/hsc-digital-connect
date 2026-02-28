import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Employee = Tables<"employees">;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSaved: () => void;
}

const emptyForm = {
  id: "",
  full_name: "",
  position: "",
  department: "",
  email: "",
  phone: "",
  phone_ext: "",
  company_name: "HSC",
  linkedin_url: "",
  facebook_url: "",
  zalo_phone: "",
  website_url: "",
  address: "",
};

export default function EmployeeFormDialog({ open, onOpenChange, employee, onSaved }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isEdit = !!employee;

  useEffect(() => {
    if (employee) {
      setForm({
        id: employee.id,
        full_name: employee.full_name,
        position: employee.position,
        department: employee.department,
        email: employee.email,
        phone: employee.phone,
        phone_ext: employee.phone_ext || "",
        company_name: employee.company_name,
        linkedin_url: employee.linkedin_url || "",
        facebook_url: employee.facebook_url || "",
        zalo_phone: employee.zalo_phone || "",
        website_url: employee.website_url || "",
        address: employee.address || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [employee, open]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.id || !form.full_name || !form.email || !form.phone || !form.position || !form.department) {
      toast({ title: "Vui lòng điền đầy đủ thông tin bắt buộc", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      id: form.id.trim(),
      full_name: form.full_name.trim(),
      position: form.position.trim(),
      department: form.department.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      phone_ext: form.phone_ext.trim() || null,
      company_name: form.company_name.trim(),
      linkedin_url: form.linkedin_url.trim() || null,
      facebook_url: form.facebook_url.trim() || null,
      zalo_phone: form.zalo_phone.trim() || null,
      website_url: form.website_url.trim() || null,
      address: form.address.trim() || null,
    };

    let error;
    if (isEdit) {
      const { id, ...rest } = payload;
      ({ error } = await supabase.from("employees").update(rest).eq("id", employee!.id));
    } else {
      ({ error } = await supabase.from("employees").insert(payload));
    }

    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isEdit ? "Đã cập nhật" : "Đã thêm nhân viên mới" });
      onOpenChange(false);
      onSaved();
    }
    setSaving(false);
  };

  const fields = [
    { key: "id", label: "Mã nhân viên *", disabled: isEdit, placeholder: "VD: 123, NV001" },
    { key: "full_name", label: "Họ và tên *", placeholder: "Nguyễn Văn A" },
    { key: "position", label: "Chức vụ *", placeholder: "Giám đốc Kinh doanh" },
    { key: "department", label: "Phòng ban *", placeholder: "Phòng Kinh Doanh" },
    { key: "email", label: "Email *", placeholder: "email@hsc.com.vn", type: "email" },
    { key: "phone", label: "Số điện thoại *", placeholder: "+84 28 1234 5678" },
    { key: "phone_ext", label: "Số nhánh", placeholder: "101" },
    { key: "company_name", label: "Tên công ty", placeholder: "HSC" },
    { key: "linkedin_url", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/..." },
    { key: "facebook_url", label: "Facebook URL", placeholder: "https://facebook.com/..." },
    { key: "zalo_phone", label: "Số Zalo", placeholder: "0901234567" },
    { key: "website_url", label: "Website", placeholder: "https://hsc.com.vn" },
    { key: "address", label: "Địa chỉ", placeholder: "Tầng 5, Tòa nhà..." },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa nhân viên" : "Thêm nhân viên mới"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs">{f.label}</Label>
              <Input
                type={f.type || "text"}
                value={(form as any)[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                disabled={f.disabled}
              />
            </div>
          ))}
          <Button onClick={handleSave} disabled={saving} className="w-full mt-4">
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
