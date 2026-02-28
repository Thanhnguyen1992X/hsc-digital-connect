import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Search, ExternalLink, QrCode, LogOut, BarChart3, Users,
  Pencil, Download,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import EmployeeFormDialog from "@/components/admin/EmployeeFormDialog";
import { QRCodeSVG } from "qrcode.react";

type Employee = Tables<"employees">;

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    // Admin RLS policy allows viewing all employees (active + inactive)
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, []);

  const toggleActive = async (emp: Employee) => {
    const { error } = await supabase
      .from("employees")
      .update({ is_active: !emp.is_active })
      .eq("id", emp.id);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      fetchEmployees();
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase())
  );

  const downloadQR = (empId: string, empName: string) => {
    const svg = document.getElementById(`qr-hidden-${empId}`);
    if (!svg) return;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = `qr-${empId}-${empName}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center">
            <Users className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground">HSC Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/analytics")}>
            <BarChart3 className="w-4 h-4 mr-1" /> Analytics
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" /> Thoát
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, phòng ban, mã NV..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => { setEditingEmployee(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Thêm nhân viên
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã NV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead className="hidden sm:table-cell">Phòng ban</TableHead>
                  <TableHead className="hidden md:table-cell">Chức vụ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-mono text-sm">{emp.id}</TableCell>
                    <TableCell className="font-medium">{emp.full_name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{emp.department}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{emp.position}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={emp.is_active} onCheckedChange={() => toggleActive(emp)} />
                        <Badge variant={emp.is_active ? "default" : "secondary"} className="text-xs">
                          {emp.is_active ? "Hiện" : "Ẩn"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingEmployee(emp); setFormOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/${emp.id}`} target="_blank">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => downloadQR(emp.id, emp.full_name)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      {/* Hidden QR for download */}
                      <div className="hidden">
                        <QRCodeSVG
                          id={`qr-hidden-${emp.id}`}
                          value={`${window.location.origin}/${emp.id}?src=qr`}
                          size={512}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy nhân viên nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editingEmployee}
        onSaved={fetchEmployees}
      />
    </div>
  );
}
