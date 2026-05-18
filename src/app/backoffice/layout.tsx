import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ui/ThemeToggle";

export const metadata: Metadata = { title: "Administration — VisitFlow" };

export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Use admin client to bypass RLS (admin may have no agence_id)
  const admin = createAdminClient();
  const { data: agent } = await admin
    .from("agents")
    .select("role, nom, prenom, email")
    .eq("user_id", user.id)
    .single();

  // Double vérification : doit être ADMIN
  if (!agent || agent.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header admin */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">VisitFlow Admin</p>
              <p className="text-xs text-slate-400">Zone d&apos;administration sécurisée</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{agent.prenom} {agent.nom}</p>
              <p className="text-xs text-slate-400">{agent.email}</p>
            </div>
            <span className="rounded-full bg-red-900/50 px-2.5 py-0.5 text-xs font-medium text-red-300">
              ADMIN
            </span>
            <ThemeToggle />
            <a
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              ← Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Bannière d'avertissement */}
      <div className="border-b border-red-900/40 bg-red-950/30 px-6 py-2">
        <p className="mx-auto max-w-7xl text-xs text-red-300">
          ⚠ Espace réservé aux administrateurs — Les actions effectuées ici sont irréversibles et affectent tous les utilisateurs.
        </p>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
