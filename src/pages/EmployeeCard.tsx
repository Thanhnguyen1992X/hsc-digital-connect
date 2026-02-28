import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { downloadVCard } from "@/lib/vcf";
import CardHeader from "@/components/card/CardHeader";
import ActionButton from "@/components/card/ActionButton";
import QRCodeModal from "@/components/card/QRCodeModal";
import type { Tables } from "@/integrations/supabase/types";
import {
  Phone, Mail, MessageCircle, Linkedin, Globe, Download, QrCode, MapPin, Facebook,
} from "lucide-react";

type Employee = Tables<"employees">;

export default function EmployeeCard() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [searchParams] = useSearchParams();
  const [qrOpen, setQrOpen] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) return;
    const fetchAndTrack = async () => {
      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("id", employeeId)
        .eq("is_active", true)
        .maybeSingle();
      setEmployee(data);
      setLoading(false);

      // Track view
      if (data) {
        const source = searchParams.get("src") || "direct";
        await supabase.from("card_views").insert({
          employee_id: data.id,
          source,
          user_agent: navigator.userAgent,
        });
      }
    };
    fetchAndTrack();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-navy flex items-center justify-center">
            <span className="text-3xl text-primary-foreground font-bold">?</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Danh thiếp không tìm thấy</h1>
          <p className="text-muted-foreground">Mã nhân viên không tồn tại hoặc đã bị ẩn.</p>
        </div>
      </div>
    );
  }

  const cardUrl = window.location.origin + "/" + employee.id;

  return (
    <div className="min-h-screen bg-background flex items-start justify-center py-6 px-4 sm:py-12">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg card-shadow-lg overflow-hidden animate-scale-in">
          <CardHeader employee={employee} />

          <div className="pt-16 pb-6 px-5 text-center">
            <h1 className="text-xl font-bold text-foreground">{employee.full_name}</h1>
            <p className="text-sm font-medium text-gold-dark mt-1">{employee.position}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{employee.department}</p>
            {employee.phone_ext && (
              <p className="text-xs text-muted-foreground mt-1">Ext: {employee.phone_ext}</p>
            )}
          </div>

          <div className="px-5 pb-5 space-y-2.5">
            <ActionButton icon={<Phone className="w-4 h-4" />} label={`Gọi điện: ${employee.phone}`} href={`tel:${employee.phone.replace(/\s/g, "")}`} variant="primary" />
            <ActionButton icon={<Mail className="w-4 h-4" />} label={employee.email} href={`mailto:${employee.email}`} />
            {employee.zalo_phone && <ActionButton icon={<MessageCircle className="w-4 h-4" />} label="Nhắn Zalo" href={`https://zalo.me/${employee.zalo_phone}`} />}
            {employee.linkedin_url && <ActionButton icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" href={employee.linkedin_url} />}
            {employee.facebook_url && <ActionButton icon={<Facebook className="w-4 h-4" />} label="Facebook" href={employee.facebook_url} />}
            {employee.website_url && <ActionButton icon={<Globe className="w-4 h-4" />} label="Website công ty" href={employee.website_url} />}

            <div className="pt-2 grid grid-cols-2 gap-2.5">
              <ActionButton icon={<Download className="w-4 h-4" />} label="Lưu Danh Bạ" onClick={() => downloadVCard(employee)} variant="accent" />
              <ActionButton icon={<QrCode className="w-4 h-4" />} label="Mã QR" onClick={() => setQrOpen(true)} variant="accent" />
            </div>
          </div>

          {employee.address && (
            <div className="px-5 pb-5">
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary rounded-lg p-3">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{employee.address}</span>
              </div>
            </div>
          )}

          <div className="border-t border-border px-5 py-3 text-center">
            <p className="text-[11px] text-muted-foreground">
              Powered by <span className="font-semibold text-foreground">{employee.company_name}</span>
            </p>
          </div>
        </div>
      </div>

      <QRCodeModal open={qrOpen} onOpenChange={setQrOpen} url={cardUrl} employeeName={employee.full_name} />
    </div>
  );
}
