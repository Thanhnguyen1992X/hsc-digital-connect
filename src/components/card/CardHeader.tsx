import type { Employee } from "@/data/mockEmployees";
import cardHeaderBg from "@/assets/card-header-bg.jpg";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface CardHeaderProps {
  employee: Employee;
}

export default function CardHeader({ employee }: CardHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-t-lg">
      {/* Background */}
      <div className="h-44 w-full relative">
        <img
          src={cardHeaderBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 gradient-navy opacity-80" />
        {/* Company name */}
        <div className="absolute top-4 left-5 flex items-center gap-2">
          <span className="text-lg font-bold tracking-wide text-primary-foreground opacity-90">
            {employee.company_name}
          </span>
        </div>
      </div>

      {/* Avatar */}
      <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
        <div className="w-28 h-28 rounded-full border-4 border-card bg-card card-shadow-lg overflow-hidden flex items-center justify-center">
          {employee.avatar_url ? (
            <img
              src={employee.avatar_url}
              alt={employee.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-navy flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">
                {getInitials(employee.full_name)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
