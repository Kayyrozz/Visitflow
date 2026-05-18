import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function RecentVisits() {
  const supabase = createClient();
  const { data: visits } = await supabase
    .from("visites")
    .select(`
      id, date_visite, statut,
      prospect:prospects(nom, prenom),
      bien:biens(adresse, ville)
    `)
    .order("date_visite", { ascending: false })
    .limit(5);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="font-semibold text-gray-900">Visites récentes</h2>
        <Link href="/visits" className="text-sm text-brand-600 hover:text-brand-700">
          Voir tout
        </Link>
      </div>

      {!visits || visits.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-gray-400">
          Aucune visite enregistrée
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {visits.map((visit) => {
            const prospect = Array.isArray(visit.prospect) ? visit.prospect[0] : visit.prospect;
            const bien = Array.isArray(visit.bien) ? visit.bien[0] : visit.bien;
            return (
              <Link
                key={visit.id}
                href={`/visits/${visit.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {prospect ? `${prospect.prenom} ${prospect.nom}` : "—"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {bien ? `${bien.adresse}, ${bien.ville}` : "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatDateTime(new Date(visit.date_visite))}
                  </p>
                </div>
                <Badge status={visit.statut as "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "ANNULEE"} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
