import { Link } from "react-router-dom";
import { mockEmployees } from "@/data/mockEmployees";
import { Users, ExternalLink } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center animate-fade-in-up">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-navy flex items-center justify-center card-shadow">
          <Users className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">HSC Digital Name Card</h1>
        <p className="text-muted-foreground mb-8">
          Hệ thống danh thiếp kỹ thuật số nội bộ công ty
        </p>

        <div className="space-y-3">
          {mockEmployees.map((emp) => (
            <Link
              key={emp.id}
              to={`/${emp.id}`}
              className="flex items-center justify-between p-4 rounded-lg bg-card card-shadow hover:card-shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-navy flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">
                    {emp.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground text-sm">{emp.full_name}</p>
                  <p className="text-xs text-muted-foreground">{emp.position}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </Link>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Truy cập danh thiếp: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">/mã_nhân_viên</code>
        </p>
      </div>
    </div>
  );
};

export default Index;
