import { createAdminClient } from "@/lib/supabase/server";
import AdminAgentsTable from "@/components/admin/AdminAgentsTable";
import AdminAgenceCard from "@/components/admin/AdminAgenceCard";
import AdminSubscriptionsTable from "@/components/admin/AdminSubscriptionsTable";
import AdminSupportChat from "@/components/admin/AdminSupportChat";

export default async function BackofficePage() {
  const admin = createAdminClient();

  // Toutes les données en parallèle
  const [
    { data: agents },
    { data: agences },
    { count: totalVisites },
    { count: totalProspects },
    { data: subscriptions },
    { data: supportMessages },
  ] = await Promise.all([
    admin
      .from("agents")
      .select(`
        id, prenom, nom, email, role, actif, telephone, created_at,
        agence:agences(id, nom)
      `)
      .order("created_at", { ascending: false }),
    admin
      .from("agences")
      .select("id, nom, email, telephone, adresse, ville, created_at")
      .order("created_at", { ascending: false }),
    admin.from("visites").select("*", { count: "exact", head: true }),
    admin.from("prospects").select("*", { count: "exact", head: true }),
    admin
      .from("subscriptions")
      .select(`
        id, agent_id, status, trial_end, current_period_end,
        cancel_at_period_end, stripe_customer_id, stripe_subscription_id, updated_at,
        agent:agents(prenom, nom, email)
      `)
      .order("updated_at", { ascending: false }),
    admin
      .from("support_messages")
      .select("id, agent_id, agent_name, agent_email, sender, content, read_by_admin, created_at")
      .order("created_at", { ascending: true }),
  ]);

  // Compter les visites par agent
  const { data: visitesCounts } = await admin
    .from("visites")
    .select("agent_id");

  const visitesParAgent: Record<string, number> = {};
  for (const v of visitesCounts ?? []) {
    visitesParAgent[v.agent_id] = (visitesParAgent[v.agent_id] ?? 0) + 1;
  }

  // Compter les agents par agence
  const agentsParAgence: Record<string, number> = {};
  for (const a of agents ?? []) {
    const agenceId = (a.agence as { id: string } | null)?.id;
    if (agenceId) agentsParAgence[agenceId] = (agentsParAgence[agenceId] ?? 0) + 1;
  }

  const agentsWithCount = (agents ?? []).map((a) => ({
    ...a,
    agence: a.agence as { id: string; nom: string } | null,
    _count: { visites: visitesParAgent[a.id] ?? 0, prospects: 0 },
  }));

  const agencesWithCount = (agences ?? []).map((ag) => ({
    ...ag,
    agentCount: agentsParAgence[ag.id] ?? 0,
  }));

  const totalAgents = agents?.length ?? 0;
  const activeAgents = agents?.filter((a) => a.actif).length ?? 0;
  const adminCount = agents?.filter((a) => a.role === "ADMIN").length ?? 0;

  const activeSubscriptions = subscriptions?.filter(
    (s) => s.status === "active" || s.status === "manual_active"
  ).length ?? 0;
  const trialSubscriptions = subscriptions?.filter((s) => s.status === "trialing").length ?? 0;
  const openSupportMessages = supportMessages?.filter((m) => m.sender === "agent" && !m.read_by_admin).length ?? 0;

  const stats = [
    { label: "Agences", value: agences?.length ?? 0, icon: "🏢", color: "text-blue-400" },
    { label: "Comptes total", value: totalAgents, icon: "👥", color: "text-violet-400" },
    { label: "Comptes actifs", value: activeAgents, icon: "✅", color: "text-green-400" },
    { label: "Abonnés actifs", value: activeSubscriptions, icon: "💳", color: "text-teal-400" },
    { label: "En essai", value: trialSubscriptions, icon: "⏳", color: "text-amber-400" },
    { label: "Visites", value: totalVisites ?? 0, icon: "🏠", color: "text-cyan-400" },
    { label: "Support non lu", value: openSupportMessages, icon: "💬", color: openSupportMessages > 0 ? "text-red-400" : "text-slate-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-white">Tableau de bord admin</h1>
        <p className="mt-1 text-sm text-slate-400">
          Vue globale de tous les comptes et agences sur la plateforme.
        </p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-2xl">{s.icon}</p>
            <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Gestion des comptes */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Gestion des comptes</h2>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
            {totalAgents} compte{totalAgents > 1 ? "s" : ""}
          </span>
        </div>
        <AdminAgentsTable agents={agentsWithCount} agences={agences ?? []} />
      </section>

      {/* Abonnements */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Abonnements</h2>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
            {subscriptions?.length ?? 0} abonnement{(subscriptions?.length ?? 0) > 1 ? "s" : ""}
          </span>
        </div>
        <AdminSubscriptionsTable
          subscriptions={(subscriptions ?? []).map((s) => ({
            ...s,
            agent: Array.isArray(s.agent) ? s.agent[0] ?? null : s.agent ?? null,
          }))}
        />
      </section>

      {/* Agences */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Agences</h2>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
            {agencesWithCount.length} agence{agencesWithCount.length > 1 ? "s" : ""}
          </span>
        </div>
        {agencesWithCount.length === 0 ? (
          <p className="text-sm text-slate-600">Aucune agence enregistrée.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agencesWithCount.map((ag) => (
              <AdminAgenceCard key={ag.id} agence={ag} />
            ))}
          </div>
        )}
      </section>

      {/* Support */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">Messages de support</h2>
            {openSupportMessages > 0 && (
              <span className="rounded-full bg-red-900/40 border border-red-700/50 px-2.5 py-0.5 text-xs font-medium text-red-300">
                {openSupportMessages} non lu{openSupportMessages > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <AdminSupportChat initialMessages={(supportMessages ?? []) as { id: string; agent_id: string; agent_name: string; agent_email: string; sender: "agent" | "admin"; content: string; read_by_admin: boolean; created_at: string }[]} />
      </section>
    </div>
  );
}
