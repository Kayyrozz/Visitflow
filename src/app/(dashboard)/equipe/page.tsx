import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import TeamManager from "@/components/team/TeamManager";

export const metadata: Metadata = { title: "Équipe — VisitFlow" };

export default async function EquipePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: me } = await admin
    .from("agents")
    .select("id, prenom, nom, role, agence_id, agence:agences(id, nom)")
    .eq("user_id", user.id)
    .single();

  if (!me) redirect("/login");
  if (!me.agence_id) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Aucune agence associée</p>
        <p className="mt-2 text-sm text-gray-500">
          Contactez votre administrateur pour être rattaché à une agence.
        </p>
      </div>
    );
  }

  const agence = Array.isArray(me.agence) ? me.agence[0] : me.agence;
  const canManage = me.role === "MANAGER" || me.role === "ADMIN";

  const { data: members } = await admin
    .from("agents")
    .select("id, prenom, nom, email, telephone, role, actif, created_at")
    .eq("agence_id", me.agence_id)
    .order("created_at", { ascending: true });

  return (
    <TeamManager
      members={members ?? []}
      agenceName={agence?.nom ?? "Votre agence"}
      currentAgentId={me.id}
      canManage={canManage}
    />
  );
}
