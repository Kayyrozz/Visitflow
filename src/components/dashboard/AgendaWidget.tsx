import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function AgendaWidget() {
  const today = formatDate(new Date());
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const supabase = createClient();
  const { data: visits } = await supabase
    .from("visites")
    .select(`
      id, date_visite,
      prospect:prospects(prenom, nom),
      bien:biens(adresse)
    `)
    .gte("date_visite", startOfDay.toISOString())
    .lte("date_visite", endOfDay.toISOString())
    .order("date_visite", { ascending: true });

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="font-semibold text-gray-900">Aujourd&apos;hui</h2>
        <p className="text-sm text-gray-500">{today}</p>
      </div>

      {!visits || visits.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-gray-400">
          Aucune visite aujourd&apos;hui
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {visits.map((visit) => {
            const prospect = Array.isArray(visit.prospect) ? visit.prospect[0] : visit.prospect;
            const bien = Array.isArray(visit.bien) ? visit.bien[0] : visit.bien;
            const time = new Date(visit.date_visite).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div key={visit.id} className="flex items-start gap-3 px-6 py-4">
                <div className="mt-0.5 w-12 text-right text-sm font-semibold text-brand-600">
                  {time}
                </div>
                <div className="h-full w-px bg-gray-200" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {prospect ? `${prospect.prenom} ${prospect.nom}` : "—"}
                  </p>
                  <p className="text-xs text-gray-500">{bien?.adresse ?? "—"}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
