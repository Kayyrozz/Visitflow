import type { Metadata } from "next";
import StatsCard from "@/components/dashboard/StatsCard";
import ProspectHeatList from "@/components/prospects/ProspectHeatList";
import { getProspectsWithHeatScores } from "@/lib/supabase/queries/prospects";
import { getBiens } from "@/lib/supabase/queries/biens";
import { getHeatLevel } from "@/components/prospects/HeatBadge";
import {
  Users,
  Thermometer,
  TrendingUp,
  Calendar,
  Flame,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tableau de bord — VisitFlow",
};

export default async function DashboardPage() {
  const [prospects, biensResult] = await Promise.all([
    getProspectsWithHeatScores().catch(() => []),
    getBiens({ limit: 200 }).catch(() => ({ data: [], count: 0 })),
  ]);

  const biens = biensResult.data ?? [];

  const withScore = prospects.filter((p) => p.heatScore !== null);
  const chauds = withScore.filter((p) => getHeatLevel(p.heatScore) === "chaud").length;
  const avgScore =
    withScore.length > 0
      ? Math.round(
          withScore.reduce((acc, p) => acc + (p.heatScore ?? 0), 0) /
            withScore.length
        )
      : null;

  const totalVisites = prospects.reduce((acc, p) => acc + p.visites.length, 0);

  const stats = [
    {
      label: "Prospects actifs",
      value: String(prospects.length),
      icon: Users,
      trend: `${withScore.length} évalué${withScore.length !== 1 ? "s" : ""}`,
      trendUp: true,
    },
    {
      label: "Prospects chauds",
      value: String(chauds),
      icon: Flame,
      trend:
        withScore.length > 0
          ? `${Math.round((chauds / withScore.length) * 100)}% des évalués`
          : "Aucun évalué",
      trendUp: chauds > 0,
    },
    {
      label: "Score moyen",
      value: avgScore !== null ? `${avgScore}/10` : "—",
      icon: Thermometer,
      trend: avgScore !== null ? (avgScore >= 7 ? "Excellent" : avgScore >= 5 ? "Bon" : "À améliorer") : "Pas de données",
      trendUp: avgScore !== null && avgScore >= 5,
    },
    {
      label: "Total visites",
      value: String(totalVisites),
      icon: Calendar,
      trend: `${biens.length} bien${biens.length !== 1 ? "s" : ""} actif${biens.length !== 1 ? "s" : ""}`,
      trendUp: totalVisites > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Suivez vos prospects et leur niveau d&apos;intérêt en temps réel
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 sm:flex">
          <TrendingUp className="h-4 w-4 text-brand-500 dark:text-blue-400" />
          Mis à jour maintenant
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* ── Prospects heat section ── */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Score de chaleur des prospects
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Filtrez par bien, niveau de chaleur ou prospect · cliquez sur une
            carte pour afficher la fiche détaillée
          </p>
        </div>

        {prospects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-900">
            <Users className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="font-medium text-gray-400 dark:text-gray-500">Aucun prospect enregistré</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
              Ajoutez des prospects et planifiez des visites pour voir leur score
              de chaleur
            </p>
          </div>
        ) : (
          <ProspectHeatList initialProspects={prospects} biens={biens} />
        )}
      </div>
    </div>
  );
}
