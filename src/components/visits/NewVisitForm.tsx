"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVisite } from "@/lib/actions";
import Button from "@/components/ui/Button";

type Prospect = { id: string; prenom: string; nom: string };
type Bien = { id: string; titre: string; adresse: string; ville: string };

export default function NewVisitForm({
  prospects,
  biens,
}: {
  prospects: Prospect[];
  biens: Bien[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const prospect_id = fd.get("prospect_id") as string;
    const bien_id = fd.get("bien_id") as string;
    const date_visite = fd.get("date_visite") as string;
    const duree = fd.get("duree_minutes") as string;
    const notes = fd.get("notes") as string;

    if (!prospect_id || !bien_id || !date_visite) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    startTransition(async () => {
      try {
        await createVisite({
          prospect_id,
          bien_id,
          date_visite: new Date(date_visite).toISOString(),
          duree_minutes: parseInt(duree) || 60,
          notes: notes || undefined,
        });
        router.push("/visits");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prospect <span className="text-red-500">*</span>
        </label>
        {prospects.length === 0 ? (
          <p className="text-sm text-amber-600 rounded-lg bg-amber-50 px-3 py-2">
            Aucun prospect disponible — créez d&apos;abord un client dans l&apos;onglet Clients.
          </p>
        ) : (
          <select
            name="prospect_id"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Sélectionner un prospect…</option>
            {prospects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.prenom} {p.nom}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bien <span className="text-red-500">*</span>
        </label>
        {biens.length === 0 ? (
          <p className="text-sm text-amber-600 rounded-lg bg-amber-50 px-3 py-2">
            Aucun bien disponible — ajoutez d&apos;abord un bien immobilier.
          </p>
        ) : (
          <select
            name="bien_id"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Sélectionner un bien…</option>
            {biens.map((b) => (
              <option key={b.id} value={b.id}>
                {b.titre} — {b.adresse}, {b.ville}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date et heure <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="date_visite"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
          <select
            name="duree_minutes"
            defaultValue="60"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">1h</option>
            <option value="90">1h30</option>
            <option value="120">2h</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Informations complémentaires…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isPending} disabled={prospects.length === 0 || biens.length === 0}>
          Créer la visite
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
