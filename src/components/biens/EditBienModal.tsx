"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Pencil } from "lucide-react";
import { updateBien } from "@/lib/actions";
import Button from "@/components/ui/Button";

const TYPES = [
  { value: "APPARTEMENT", label: "Appartement" },
  { value: "MAISON", label: "Maison" },
  { value: "TERRAIN", label: "Terrain" },
  { value: "COMMERCIAL", label: "Local commercial" },
  { value: "AUTRE", label: "Autre" },
];

const STATUTS = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "SOUS_COMPROMIS", label: "Sous compromis" },
  { value: "VENDU", label: "Vendu" },
  { value: "RETIRE", label: "Retiré" },
];

type Bien = {
  id: string;
  titre: string;
  type: string;
  adresse: string;
  ville: string;
  code_postal: string;
  surface: number | null;
  prix: number | null;
  description: string | null;
  statut: string;
};

export default function EditBienModal({ bien }: { bien: Bien }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateBien(bien.id, {
          titre: fd.get("titre") as string,
          type: fd.get("type") as string,
          adresse: fd.get("adresse") as string,
          ville: fd.get("ville") as string,
          code_postal: fd.get("code_postal") as string,
          surface: fd.get("surface") ? Number(fd.get("surface")) : null,
          prix: fd.get("prix") ? Number(fd.get("prix")) : null,
          description: (fd.get("description") as string) || undefined,
          statut: fd.get("statut") as string,
        });
        setIsOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Pencil className="h-4 w-4" />
        Modifier
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">Modifier le bien</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre <span className="text-red-500">*</span></label>
                <input name="titre" required defaultValue={bien.titre}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                  <select name="type" required defaultValue={bien.type}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                    {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut <span className="text-red-500">*</span></label>
                  <select name="statut" required defaultValue={bien.statut}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                    {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse <span className="text-red-500">*</span></label>
                <input name="adresse" required defaultValue={bien.adresse}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville <span className="text-red-500">*</span></label>
                  <input name="ville" required defaultValue={bien.ville}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code postal <span className="text-red-500">*</span></label>
                  <input name="code_postal" required defaultValue={bien.code_postal}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                  <input name="surface" type="number" min="0" defaultValue={bien.surface ?? ""}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                  <input name="prix" type="number" min="0" defaultValue={bien.prix ?? ""}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows={3} defaultValue={bien.description ?? ""}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>

              <div className="flex gap-3 border-t border-gray-100 pt-4">
                <Button type="submit" loading={isPending}>Enregistrer</Button>
                <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Annuler</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
