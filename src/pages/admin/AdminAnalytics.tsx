import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Users, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ViewRow {
  employee_id: string;
  viewed_at: string;
  source: string;
}

export default function AdminAnalytics() {
  const [views, setViews] = useState<ViewRow[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [days, setDays] = useState("30");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const since = new Date();
      since.setDate(since.getDate() - parseInt(days));

      const [vRes, eRes] = await Promise.all([
        supabase.from("card_views").select("employee_id, viewed_at, source").gte("viewed_at", since.toISOString()),
        supabase.from("employees").select("id, full_name"),
      ]);
      setViews(vRes.data || []);
      setEmployees(eRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [days]);

  const filtered = useMemo(
    () => (sourceFilter === "all" ? views : views.filter((v) => v.source === sourceFilter)),
    [views, sourceFilter]
  );

  const empMap = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e.full_name])),
    [employees]
  );

  // Top employees
  const topEmployees = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((v) => { counts[v.employee_id] = (counts[v.employee_id] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ name: empMap[id] || id, views: count }));
  }, [filtered, empMap]);

  // Daily chart
  const dailyData = useMemo(() => {
    const d: Record<string, number> = {};
    filtered.forEach((v) => {
      const day = v.viewed_at.slice(0, 10);
      d[day] = (d[day] || 0) + 1;
    });
    return Object.entries(d)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date: date.slice(5), views: count }));
  }, [filtered]);

  // Source breakdown
  const sourceCounts = useMemo(() => {
    const c = { qr: 0, nfc: 0, direct: 0, unknown: 0 };
    views.forEach((v) => {
      const s = v.source as keyof typeof c;
      c[s] = (c[s] || 0) + 1;
    });
    return c;
  }, [views]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 sm:px-6 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <BarChart3 className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-bold text-foreground">Analytics</h1>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Filters */}
        <div className="flex gap-3">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày</SelectItem>
              <SelectItem value="30">30 ngày</SelectItem>
              <SelectItem value="90">90 ngày</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nguồn</SelectItem>
              <SelectItem value="qr">QR Code</SelectItem>
              <SelectItem value="nfc">NFC</SelectItem>
              <SelectItem value="direct">Trực tiếp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Eye className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
                  <p className="text-xs text-muted-foreground">Tổng lượt xem</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{sourceCounts.qr}</p>
                  <p className="text-xs text-muted-foreground">QR Code</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{sourceCounts.nfc}</p>
                  <p className="text-xs text-muted-foreground">NFC</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{sourceCounts.direct}</p>
                  <p className="text-xs text-muted-foreground">Trực tiếp</p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Lượt xem theo ngày</CardTitle></CardHeader>
              <CardContent>
                {dailyData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top employees */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Top 10 nhân viên được xem nhiều nhất</CardTitle></CardHeader>
              <CardContent>
                {topEmployees.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Chưa có dữ liệu</p>
                ) : (
                  <div className="space-y-2">
                    {topEmployees.map((e, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full gradient-navy text-primary-foreground text-xs flex items-center justify-center font-bold">{i + 1}</span>
                          <span className="text-sm font-medium text-foreground">{e.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{e.views} lượt</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
