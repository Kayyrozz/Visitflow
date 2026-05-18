import { cn } from "@/lib/utils";
import type { VisitStatus } from "@/types";

const statusConfig: Record<VisitStatus, { label: string; className: string }> = {
  PLANIFIEE: { label: "Planifiée", className: "bg-blue-50 text-blue-700" },
  EN_COURS: { label: "En cours", className: "bg-yellow-50 text-yellow-700" },
  TERMINEE: { label: "Terminée", className: "bg-green-50 text-green-700" },
  ANNULEE: { label: "Annulée", className: "bg-red-50 text-red-700" },
};

interface BadgeProps {
  status: VisitStatus;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
