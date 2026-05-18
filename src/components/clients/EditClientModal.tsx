"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { updateProspect } from "@/lib/actions";
import Button from "@/components/ui/Button";

type Prospect = {
  id: string;
  prenom: string;
  nom: string;
  email?: string | null;
  telephone?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  notes?: string | null;
  statut: string;
};

export default function EditClientModal({
  prospect,
  onClose,
}: {
  prospect: Prospect;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateProspect(prospect.id, {
          prenom: fd.get("prenom") as string,
          nom: fd.get("nom") as string,
          email: (fd.get("email") as string) || undefined,
          telephone: (fd.get("telephone") as string) || undefined,
          budget_min: fd.get("budget_min") ? Number(fd.get("budget_min")) : null,
          budget_max: fd.get("budget_max") ? Number(fd.get("budget_max")) : null,
          notes: (fd.get("notes") as string) || undefined,
          statut: fd.get("statut") as string,
        });
        onClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">
            Modifier — {prospect.prenom} {prospect.nom}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] space-y-4 overflow-y-auto px-6 py-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="prenom"
                required
                defaultValue={prospect.prenom}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nom"
                required
                defaultValue={prospect.nom}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              defaultValue={prospect.email ?? ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone</label>
            <input
              type="tel"
              name="telephone"
              defaultValue={prospect.telephone ?? ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Budget min (€)</label>
              <input
                type="number"
                name="budget_min"
                defaultValue={prospect.budget_min ?? ""}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Budget max (€)</label>
              <input
                type="number"
                name="budget_max"
                defaultValue={prospect.budget_max ?? ""}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Statut</label>
            <select
              name="statut"
              defaultValue={prospect.statut}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
              <option value="CONVERTI">Converti</option>
              <option value="PERDU">Perdu</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={prospect.notes ?? ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex gap-3 border-t border-gray-100 pt-4">
            <Button type="submit" loading={isPending}>
              Enregistrer
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
