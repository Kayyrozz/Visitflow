import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats(agentId: string) {
  const supabase = createClient();

  const now = new Date().toISOString();
  const firstDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();

  const [visites, prospects, biens, scores] = await Promise.all([
    supabase
      .from("visites")
      .select("id, statut, date_visite", { count: "exact" })
      .eq("agent_id", agentId),

    supabase
      .from("prospects")
      .select("id, statut, created_at", { count: "exact" })
      .eq("agent_id", agentId),

    supabase
      .from("biens")
      .select("id, statut", { count: "exact" })
      .eq("agent_id", agentId),

    supabase
      .from("scores")
      .select("interet, coup_de_coeur")
      .in(
        "visite_id",
        (await supabase
          .from("visites")
          .select("id")
          .eq("agent_id", agentId)
          .then(({ data }) => data?.map((v) => v.id) ?? []))
      ),
  ]);

  const visiteData = visites.data ?? [];
  const prospectData = prospects.data ?? [];

  return {
    totalVisites: visites.count ?? 0,
    visitesAVenir: visiteData.filter(
      (v) => v.statut === "PLANIFIEE" && v.date_visite >= now
    ).length,
    visitesTerminees: visiteData.filter((v) => v.statut === "TERMINEE").length,
    totalProspects: prospects.count ?? 0,
    nouveauxProspects: prospectData.filter(
      (p) => p.created_at >= firstDayOfMonth
    ).length,
    totalBiens: biens.count ?? 0,
    tauxCompletion:
      visiteData.length > 0
        ? Math.round(
            (visiteData.filter((v) => v.statut === "TERMINEE").length /
              visiteData.length) *
              100
          )
        : 0,
    interetMoyen:
      scores.data && scores.data.length > 0
        ? Math.round(
            (scores.data.reduce((acc, s) => acc + (s.interet ?? 0), 0) /
              scores.data.filter((s) => s.interet !== null).length) *
              10
          ) / 10
        : null,
    coupsDeCoeur: scores.data?.filter((s) => s.coup_de_coeur).length ?? 0,
  };
}
