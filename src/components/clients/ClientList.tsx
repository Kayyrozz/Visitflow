import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ClientListClient from "./ClientListClient";

export default async function ClientList() {
  const supabase = createClient();
  const { data: prospects } = await supabase
    .from("prospects")
    .select("id, nom, prenom, email, telephone, statut, budget_min, budget_max, notes")
    .order("created_at", { ascending: false });

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <input
          type="text"
          placeholder="Rechercher un client…"
          className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {!prospects || prospects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-gray-200" />
          <p className="font-medium text-gray-400">Aucun client enregistré</p>
          <p className="mt-1 text-sm text-gray-300">Ajoutez votre premier client pour commencer</p>
        </div>
      ) : (
        <ClientListClient prospects={prospects} />
      )}
    </div>
  );
}
