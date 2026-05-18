import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendSupportNotification } from "@/lib/resend";

const schema = z.object({
  content: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const admin = createAdminClient();

  const { data: agent } = await admin
    .from("agents")
    .select("id, prenom, nom, email")
    .eq("user_id", user.id)
    .single();

  if (!agent) return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });

  const agentName = `${agent.prenom} ${agent.nom}`;

  // Check if this is the first message (to send email notification)
  const { count } = await admin
    .from("support_messages")
    .select("id", { count: "exact", head: true })
    .eq("agent_id", agent.id)
    .eq("sender", "agent");

  const { data: msg, error } = await admin
    .from("support_messages")
    .insert({
      agent_id: agent.id,
      agent_name: agentName,
      agent_email: agent.email,
      sender: "agent",
      content: parsed.data.content,
    })
    .select("id")
    .single();

  if (error || !msg) return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });

  // Send email notification only on first message or after admin last replied
  if (count === 0) {
    try {
      await sendSupportNotification({
        agentName,
        agentEmail: agent.email,
        subject: "Nouveau message de support",
        message: parsed.data.content,
        messageId: msg.id,
      });
    } catch { /* email failure doesn't block the response */ }
  }

  return NextResponse.json({ success: true });
}
