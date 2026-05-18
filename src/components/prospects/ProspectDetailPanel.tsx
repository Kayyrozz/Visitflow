"use client";

import { cn, formatDate, formatPrice, getInitials } from "@/lib/utils";
import HeatBadge, { getHeatLevel, heatConfig } from "./HeatBadge";
import type { ProspectWithHeat, VisiteWithScore } from "@/lib/supabase/queries/prospects";
import {
  Phone,
  Mail,
  Building2,
  Heart,
  MessageSquare,
  CheckCircle2,
  Clock,
  Ban,
  AlertCircle,
  Euro,
  Home,
  Star,
  X,
} from "lucide-react";

const visitStatusConfig = {
  PLANIFIEE: { label: "Planifiée", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
  EN_COURS: { label: "En cours", icon: AlertCircle, color: "text-yellow-600 bg-yellow-50 border-yellow-100" },
  TERMINEE: { label: "Terminée", icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-100" },
  ANNULEE: { label: "Annulée", icon: Ban, color: "text-red-600 bg-red-50 border-red-100" },
  NO_SHOW: { label: "No show", icon: AlertCircle, color: "text-gray-600 bg-gray-50 border-gray-100" },
};

function getScore(visite: VisiteWithScore) {
  const s = visite.score;
  if (!s) return null;
  return Array.isArray(s) ? s[0] ?? null : s;
}

interface ProspectDetailPanelProps {
  prospect: ProspectWithHeat;
  onClose?: () => void;
}

export default function ProspectDetailPanel({
  prospect,
  onClose,
}: ProspectDetailPanelProps) {
  const level = getHeatLevel(prospect.heatScore);
  const config = heatConfig[level];
  const initials = getInitials(`${prospect.prenom} ${prospect.nom}`);

  const sortedVisites = [...prospect.visites].sort(
    (a, b) => new Date(b.date_visite).getTime() - new Date(a.date_visite).getTime()
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* ── Header ── */}
      <div className={cn("border-b px-5 py-4", config.bg, config.border)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={cn(
                "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-bold text-white shadow-md",
                config.gradient
              )}
            >
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {prospect.prenom} {prospect.nom}
              </h2>
              <div
                className={cn(
                  "mt-0.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  config.bg,
                  config.text,
                  config.border
                )}
              >
                <span>{config.icon}</span>
                {config.label}
                {prospect.heatScore !== null && (
                  <span className="opacity-75">· {prospect.heatScore}/10</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HeatBadge score={prospect.heatScore} size="lg" />
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-white/60 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Contact grid */}
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {prospect.telephone && (
            <a
              href={`tel:${prospect.telephone}`}
              className="flex items-center gap-2 rounded-lg bg-white/70 dark:bg-gray-700/60 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 transition-colors hover:bg-white dark:hover:bg-gray-700"
            >
              <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              <span className="truncate">{prospect.telephone}</span>
            </a>
          )}
          {prospect.email && (
            <a
              href={`mailto:${prospect.email}`}
              className="flex items-center gap-2 rounded-lg bg-white/70 dark:bg-gray-700/60 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 transition-colors hover:bg-white dark:hover:bg-gray-700"
            >
              <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              <span className="truncate">{prospect.email}</span>
            </a>
          )}
          {(prospect.budget_min || prospect.budget_max) && (
            <div className="col-span-2 flex items-center gap-2 rounded-lg bg-white/70 dark:bg-gray-700/60 px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
              <Euro className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              Budget :{" "}
              <span className="font-medium">
                {prospect.budget_min ? formatPrice(prospect.budget_min) : "?"}{" "}
                →{" "}
                {prospect.budget_max ? formatPrice(prospect.budget_max) : "?"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Score bar ── */}
      {prospect.heatScore !== null && (
        <div className="border-b border-gray-100 px-5 py-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Score de chaleur moyen
            </span>
            <span className={cn("text-xs font-bold", config.text)}>
              {prospect.heatScore}/10
            </span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 flex-1 rounded-full",
                  i < prospect.heatScore!
                    ? `bg-gradient-to-r ${config.gradient}`
                    : "bg-gray-100"
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Visit timeline ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-5 py-4">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Home className="h-4 w-4 text-gray-400" />
            Historique des visites
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              {sortedVisites.length}
            </span>
          </h3>

          {sortedVisites.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
              Aucune visite enregistrée
            </p>
          ) : (
            <div className="relative space-y-3">
              {/* Timeline vertical line */}
              {sortedVisites.length > 1 && (
                <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-100" />
              )}

              {sortedVisites.map((visite) => {
                const statusCfg =
                  visitStatusConfig[visite.statut] ?? visitStatusConfig.PLANIFIEE;
                const StatusIcon = statusCfg.icon;
                const score = getScore(visite);
                const visitLevel = getHeatLevel(score?.interet ?? null);
                const visitConfig = heatConfig[visitLevel];

                return (
                  <div key={visite.id} className="relative pl-9">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute left-2.5 top-4 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white shadow-sm",
                        score?.interet !== null && score?.interet !== undefined
                          ? `bg-gradient-to-br ${visitConfig.gradient}`
                          : "bg-gray-200"
                      )}
                    />

                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                      {/* Visit header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {visite.bien?.titre ?? "Bien inconnu"}
                          </p>
                          {visite.bien && (
                            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
                              <Building2 className="h-3 w-3 flex-shrink-0" />
                              {visite.bien.adresse}, {visite.bien.ville}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-shrink-0 flex-col items-end gap-1">
                          <span className="text-xs text-gray-500">
                            {formatDate(visite.date_visite)}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                              statusCfg.color
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusCfg.label}
                          </span>
                        </div>
                      </div>

                      {/* Score row */}
                      {score?.interet !== null && score?.interet !== undefined && (
                        <div className="mt-3 flex items-center gap-2.5">
                          <div
                            className={cn(
                              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow-sm",
                              visitConfig.gradient
                            )}
                          >
                            {score.interet}
                          </div>
                          <div className="flex flex-1 gap-0.5">
                            {Array.from({ length: 10 }, (_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-1.5 flex-1 rounded-full",
                                  i < (score.interet ?? 0)
                                    ? `bg-gradient-to-r ${visitConfig.gradient}`
                                    : "bg-gray-200"
                                )}
                              />
                            ))}
                          </div>
                          {score.coup_de_coeur && (
                            <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                              <Heart className="h-3.5 w-3.5 fill-current" />
                              Coup de cœur
                            </span>
                          )}
                        </div>
                      )}

                      {/* SMS & feedback indicators */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {visite.sms_envoye_at ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                            <MessageSquare className="h-3 w-3" />
                            SMS envoyé
                          </span>
                        ) : null}
                        {visite.sms_relance_at ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            <MessageSquare className="h-3 w-3" />
                            Relance SMS
                          </span>
                        ) : null}
                        {visite.feedback_recu_at ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Feedback reçu
                          </span>
                        ) : null}
                        {!visite.sms_envoye_at &&
                          !visite.sms_relance_at &&
                          !visite.feedback_recu_at && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              En attente de feedback
                            </span>
                          )}
                      </div>

                      {/* Feedback content */}
                      {score?.notes && (
                        <div className="mt-3 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                          <p className="mb-1 text-xs font-medium text-gray-400">
                            Commentaires prospect
                          </p>
                          <p className="text-xs italic text-gray-700">
                            &ldquo;{score.notes}&rdquo;
                          </p>
                        </div>
                      )}
                      {score?.recommandation && (
                        <div className="mt-2 flex items-start gap-2 rounded-lg border border-brand-100 bg-brand-50 p-3">
                          <Star className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-500" />
                          <div>
                            <p className="mb-0.5 text-xs font-medium text-brand-700">
                              Recommandation agent
                            </p>
                            <p className="text-xs text-brand-900 dark:text-blue-200">
                              {score.recommandation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
