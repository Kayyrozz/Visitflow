import { cn } from "@/lib/utils";

export type HeatLevel = "chaud" | "tiede" | "froid" | "none";

export function getHeatLevel(score: number | null): HeatLevel {
  if (score === null || score === undefined) return "none";
  if (score >= 8) return "chaud";
  if (score >= 5) return "tiede";
  return "froid";
}

export const heatConfig: Record<
  HeatLevel,
  {
    label: string;
    icon: string;
    gradient: string;
    bg: string;
    text: string;
    border: string;
    ring: string;
    dot: string;
  }
> = {
  chaud: {
    label: "Chaud",
    icon: "🔥",
    gradient: "from-red-500 to-orange-400",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    ring: "ring-red-100",
    dot: "bg-red-500",
  },
  tiede: {
    label: "Tiède",
    icon: "🌡",
    gradient: "from-amber-400 to-yellow-300",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    ring: "ring-amber-100",
    dot: "bg-amber-400",
  },
  froid: {
    label: "Froid",
    icon: "❄",
    gradient: "from-blue-500 to-cyan-400",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    ring: "ring-blue-100",
    dot: "bg-blue-500",
  },
  none: {
    label: "Non évalué",
    icon: "○",
    gradient: "from-gray-300 to-gray-400",
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-200",
    ring: "ring-gray-100",
    dot: "bg-gray-300",
  },
};

interface HeatBadgeProps {
  score: number | null;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function HeatBadge({
  score,
  showLabel = false,
  size = "md",
  className,
}: HeatBadgeProps) {
  const level = getHeatLevel(score);
  const config = heatConfig[level];

  const sizeClasses = {
    sm: "h-8 w-8 text-sm font-bold",
    md: "h-11 w-11 text-lg font-bold",
    lg: "h-14 w-14 text-2xl font-bold",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm ring-2",
          config.gradient,
          config.ring,
          sizeClasses[size]
        )}
      >
        {score !== null ? score : "?"}
      </div>
      {showLabel && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            config.bg,
            config.text,
            config.border
          )}
        >
          <span>{config.icon}</span>
          {config.label}
        </span>
      )}
    </div>
  );
}
