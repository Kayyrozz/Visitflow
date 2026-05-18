import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NewVisitForm from "@/components/visits/NewVisitForm";

export const metadata: Metadata = { title: "Nouvelle visite" };

export default async function NewVisitPage() {
  const supabase = createClient();

  const [{ data: prospects }, { data: biens }] = await Promise.all([
    supabase
      .from("prospects")
      .select("id, prenom, nom")
      .eq("statut", "ACTIF")
      .order("nom"),
    supabase
      .from("biens")
      .select("id, titre, adresse, ville")
      .eq("statut", "DISPONIBLE")
      .order("titre"),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/visits"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux visites
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle visite</h1>
        <p className="mt-1 text-sm text-gray-500">
          Planifiez une visite pour un prospect et un bien
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <NewVisitForm prospects={prospects ?? []} biens={biens ?? []} />
      </div>
    </div>
  );
}
