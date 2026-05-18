"use client";

import { cn, formatDate, getInitials } from "@/lib/utils";
import HeatBadge, { getHeatLevel, heatConfig } from "./HeatBadge";
import type { ProspectWithHeat } from "@/lib/supabase/queries/prospects";
import { Phone, Calendar, Heart } from "lucide-react";

interface ProspectHeatCardProps {
  prospect: ProspectWithHeat;
  isSelected: boolean;
  onClick: () => void;
}

export default function ProspectHeatCard({
  prospect,
  isSelected,
  onClick,
}: ProspectHeatCardProps) {
  const level = getHeatLevel(prospect.heatScore);
  const config = heatConfig[level];
  const visitCount = prospect.visites.length;
  const lastVisit = [...prospect.visites].sort(
    (a, b) => new Date(b.date_visite).getTime() - new Date(a.date_visite).getTime()
  )[0];
  const hasCoupDeCoeur = prospect.visites.some(
    (v) => {
      const s = Array.isArray(v.score) ? v.score[0] : v.score;
      return s?.coup_de_coeur;
    }
  );
  const initials = getInitials(`${prospect.prenom} ${prospect.nom}`);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200",
        isSelected
          ? cn("shadow-md", config.bg, config.border)
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:bg-gray-800"
      )}
    >
      {/* Score badge */}
      <HeatBadge score={prospect.heatScore} size="md" />

      {/* Initials avatar overlay - subtle */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-gray-900">
            {prospect.prenom} {prospect.nom}
          </p>
          {hasCoupDeCoeur && (
            <Heart className="h-3.5 w-3.5 flex-shrink-0 fill-red-400 text-red-400" />
          )}
        </div>
        {prospect.telephone && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
            <Phone className="h-3 w-3 flex-shrink-0" />
            {prospect.telephone}
          </p>
        )}
        {/* Score bar */}
        {prospect.heatScore !== null && (
          <div className="mt-1.5 flex gap-0.5">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  i < prospect.heatScore!
                    ? `bg-gradient-to-r ${config.gradient}`
                    : "bg-gray-100"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>
            {visitCount} visite{visitCount !== 1 ? "s" : ""}
          </span>
        </div>
        {lastVisit && (
          <p className="mt-0.5 text-xs text-gray-400">
            {formatDate(lastVisit.date_visite)}
          </p>
        )}
        {prospect.heatScore !== null && (
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
              config.bg,
              config.text,
              config.border
            )}
          >
            <span className="text-[10px]">{config.icon}</span>
            {config.label}
          </span>
        )}
      </div>
    </button>
  );
}
