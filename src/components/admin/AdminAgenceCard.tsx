"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateAgence } from "@/lib/admin-actions";

type Agence = {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  ville: string | null;
  created_at: string;
  agentCount: number;
};

export default function AdminAgenceCard({ agence }: { agence: Agence }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nom: agence.nom,
    email: agence.email ?? "",
    telephone: agence.telephone ?? "",
    adresse: agence.adresse ?? "",
    ville: agence.ville ?? "",
  });

  const save = () => {
    setError(null);
    startTransition(async () => {
      try {
        await adminUpdateAgence(agence.id, {
          nom: form.nom,
          email: form.email || undefined,
          telephone: form.telephone || undefined,
          adresse: form.adresse || undefined,
          ville: form.ville || undefined,
        });
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      {!editing ? (
        <>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-white">{agence.nom}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Créée le {new Date(agence.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              Modifier
            </button>
          </div>
          <div className="mt-3 space-y-1 text-xs text-slate-400">
            {agence.email && <p>✉ {agence.email}</p>}
            {agence.telephone && <p>✆ {agence.telephone}</p>}
            {agence.adresse && <p>📍 {agence.adresse}{agence.ville ? `, ${agence.ville}` : ""}</p>}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2">
            <span className="text-2xl font-bold text-white">{agence.agentCount}</span>
            <span className="text-xs text-slate-400">agent{agence.agentCount > 1 ? "s" : ""}</span>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-white">Modifier l&apos;agence</p>
          {error && <p className="text-xs text-red-400">{error}</p>}
          {([
            ["nom", "Nom *"],
            ["email", "Email"],
            ["telephone", "Téléphone"],
            ["adresse", "Adresse"],
            ["ville", "Ville"],
          ] as [keyof typeof form, string][]).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-xs text-slate-400">{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              disabled={isPending || !form.nom.trim()}
              className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "…" : "Enregistrer"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 rounded-lg border border-slate-700 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
