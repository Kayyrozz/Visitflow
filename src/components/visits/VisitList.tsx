import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { MapPin, User, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function VisitList() {
  const supabase = createClient();
  const { data: visits } = await supabase
    .from("visites")
    .select(`
      id, date_visite, statut,
      prospect:prospects(nom, prenom),
      bien:biens(adresse, ville)
    `)
    .order("date_visite", { ascending: false });

  if (!visits || visits.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 px-4 py-3 scrollbar-none">
          {["Toutes", "Planifiées", "En cours", "Terminées", "Annulées"].map((f) => (
            <button
              key={f}
              className="shrink-0 rounded-full px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 first:bg-brand-50 first:text-brand-700"
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="mx-auto mb-3 h-10 w-10 text-gray-200" />
          <p className="font-medium text-gray-400">Aucune visite enregistrée</p>
          <p className="mt-1 text-sm text-gray-300">Créez votre première visite pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 px-4 py-3 scrollbar-none">
        {["Toutes", "Planifiées", "En cours", "Terminées", "Annulées"].map((f) => (
          <button
            key={f}
            className="shrink-0 rounded-full px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 first:bg-brand-50 first:text-brand-700"
          >
            {f}
          </button>
        ))}
      </div>

      <div className="divide-y divide-gray-50">
        {visits.map((visit) => {
          const date = new Date(visit.date_visite);
          const prospect = Array.isArray(visit.prospect) ? visit.prospect[0] : visit.prospect;
          const bien = Array.isArray(visit.bien) ? visit.bien[0] : visit.bien;
          return (
            <Link
              key={visit.id}
              href={`/visits/${visit.id}`}
              className="flex items-start gap-3 px-4 py-4 hover:bg-gray-50 sm:gap-4 sm:px-6"
            >
              <div className="mt-0.5 w-8 shrink-0 text-center">
                <div className="text-lg font-bold text-gray-900">{date.getDate()}</div>
                <div className="text-xs text-gray-500">
                  {date.toLocaleString("fr-FR", { month: "short" })}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-gray-900">{formatDateTime(date)}</p>
                  <Badge status={visit.statut as "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "ANNULEE"} />
                </div>
                <div className="mt-1 flex flex-col gap-0.5 text-sm text-gray-500 sm:flex-row sm:gap-4">
                  {prospect && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 shrink-0" />
                      {prospect.prenom} {prospect.nom}
                    </span>
                  )}
                  {bien && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {bien.adresse}, {bien.ville}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
