import { cn } from "@/lib/utils";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "accent" | "default";
}

export default function ActionButton({ icon, label, href, onClick, variant = "default" }: ActionButtonProps) {
  const base =
    "flex items-center gap-3 w-full px-4 py-3.5 rounded-lg font-medium text-sm transition-all duration-200 active:scale-[0.98] min-h-[48px]";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 card-shadow",
    accent: "bg-accent text-accent-foreground hover:opacity-90 card-shadow",
    default: "bg-secondary text-secondary-foreground hover:bg-muted",
  };

  const className = cn(base, variants[variant]);

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">{icon}</span>
        <span>{label}</span>
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
