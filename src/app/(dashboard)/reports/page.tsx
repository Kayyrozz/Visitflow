import type { Metadata } from "next";
import { BarChart3, TrendingUp, Calendar, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Rapports",
};

export default async function ReportsPage() {
  const supabase = createClient();

  const [{ count: totalVisites }, { count: totalProspects }, { data: visitesParMois }] =
    await Promise.all([
      supabase.from("visites").select("*", { count: "exact", head: true }),
      supabase.from("prospects").select("*", { count: "exact", head: true }),
      supabase
        .from("visites")
        .select("date_visite")
        .eq("statut", "TERMINEE")
        .order("date_visite", { ascending: true }),
    ]);

  const totalConverti = await supabase
    .from("prospects")
    .select("*", { count: "exact", head: true })
    .eq("statut", "CONVERTI");

  const convertiCount = totalConverti.count ?? 0;
  const prospectCount = totalProspects ?? 0;
  const tauxConversion =
    prospectCount > 0 ? Math.round((convertiCount / prospectCount) * 100) : 0;

  // Group visits by month
  const monthMap: Record<string, number> = {};
  (visitesParMois ?? []).forEach((v) => {
    const d = new Date(v.date_visite);
    const key = d.toLocaleString("fr-FR", { month: "short", year: "2-digit" });
    monthMap[key] = (monthMap[key] ?? 0) + 1;
  });
  const monthlyData = Object.entries(monthMap).slice(-5).map(([month, visits]) => ({ month, visits }));
  const maxVisits = monthlyData.length > 0 ? Math.max(...monthlyData.map((d) => d.visits)) : 1;

  const stats = [
    { label: "Visites totales", value: String(totalVisites ?? 0), icon: Calendar },
    { label: "Clients convertis", value: String(convertiCount), icon: Users },
    { label: "Taux de conversion", value: `${tauxConversion}%`, icon: TrendingUp },
    { label: "Prospects actifs", value: String(prospectCount), icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
        <p className="text-gray-500">Analyse de votre activité</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand-50 p-2">
                <item.icon className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-6 font-semibold text-gray-900">Visites terminées par mois</h2>
        {monthlyData.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">Aucune donnée disponible</p>
        ) : (
          <div className="flex items-end gap-4">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-sm font-medium text-gray-600">{d.visits}</span>
                <div
                  className="w-full rounded-t-md bg-brand-500"
                  style={{ height: `${(d.visits / maxVisits) * 200}px` }}
                />
                <span className="text-xs text-gray-500">{d.month}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
