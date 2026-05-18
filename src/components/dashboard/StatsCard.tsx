import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  trendUp: boolean;
}

export default function StatsCard({ label, value, icon: Icon, trend, trendUp }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        <div className="rounded-lg bg-brand-50 p-2 dark:bg-blue-900/30">
          <Icon className="h-5 w-5 text-brand-600 dark:text-blue-400" />
        </div>
      </div>
      <div className={cn("mt-3 flex items-center gap-1 text-xs font-medium", trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
        {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{trend} vs mois dernier</span>
      </div>
    </div>
  );
}
