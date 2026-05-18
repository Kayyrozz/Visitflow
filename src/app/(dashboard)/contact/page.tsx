import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import SupportChat from "@/components/support/SupportChat";

export const metadata: Metadata = { title: "Support — VisitFlow" };

export default async function ContactPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: agent } = await admin
    .from("agents")
    .select("id, prenom, nom")
    .eq("user_id", user.id)
    .single();

  if (!agent) redirect("/login");

  const { data: messages } = await admin
    .from("support_messages")
    .select("id, sender, content, created_at")
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: true });

  return (
    <SupportChat
      initialMessages={(messages ?? []) as { id: string; sender: "agent" | "admin"; content: string; created_at: string }[]}
      agentId={agent.id}
      agentName={`${agent.prenom} ${agent.nom}`}
    />
  );
}
