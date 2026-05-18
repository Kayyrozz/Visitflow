"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { createVisite, createEvenement } from "@/lib/actions";
import Button from "@/components/ui/Button";

type Prospect = { id: string; prenom: string; nom: string };
type Bien = { id: string; titre: string; adresse: string; ville: string };
type EventType = "VISITE" | "REUNION" | "RENDEZ_VOUS";

const TYPE_LABELS: Record<EventType, string> = {
  VISITE: "Visite",
  REUNION: "Réunion",
  RENDEZ_VOUS: "Rendez-vous",
};

const TYPE_COLORS: Record<EventType, string> = {
  VISITE: "bg-brand-600 text-white",
  REUNION: "bg-violet-600 text-white",
  RENDEZ_VOUS: "bg-emerald-600 text-white",
};

type Props = {
  prospects: Prospect[];
  biens: Bien[];
  defaultDateTime?: string;
  defaultType?: EventType;
  isOpen?: boolean;
  onClose?: () => void;
};

export default function NewEventModal({
  prospects,
  biens,
  defaultDateTime,
  defaultType,
  isOpen: isOpenProp,
  onClose: onCloseProp,
}: Props) {
  const router = useRouter();
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<EventType>(defaultType ?? "VISITE");

  const controlled = isOpenProp !== undefined;
  const isOpen = controlled ? isOpenProp : isOpenInternal;

  const handleClose = () => {
    setError(null);
    setType(defaultType ?? "VISITE");
    if (controlled) onCloseProp?.();
    else setIsOpenInternal(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const dateField = fd.get("date_visite") as string;

    if (!dateField) {
      setError("Veuillez renseigner la date et l'heure.");
      return;
    }

    startTransition(async () => {
      try {
        if (type === "VISITE") {
          const prospect_id = fd.get("prospect_id") as string;
          const bien_id = fd.get("bien_id") as string;
          if (!prospect_id || !bien_id) {
            setError("Veuillez sélectionner un prospect et un bien.");
            return;
          }
          await createVisite({
            prospect_id,
            bien_id,
            date_visite: new Date(dateField).toISOString(),
            duree_minutes: parseInt(fd.get("duree_minutes") as string) || 60,
            notes: (fd.get("notes") as string) || undefined,
          });
        } else {
          const titre = fd.get("titre") as string;
          if (!titre?.trim()) {
            setError("Veuillez saisir un titre.");
            return;
          }
          await createEvenement({
            titre,
            type,
            date_debut: new Date(dateField).toISOString(),
            duree_minutes: parseInt(fd.get("duree_minutes") as string) || 60,
            notes: (fd.get("notes") as string) || undefined,
            prospect_id: (fd.get("prospect_id") as string) || undefined,
          });
        }
        handleClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    });
  };

  return (
    <>
      {!controlled && (
        <button
          onClick={() => setIsOpenInternal(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Ajouter un événement
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">Nouvel événement</h2>
              <button onClick={handleClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              {/* Type selector */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
                <div className="flex gap-2">
                  {(["VISITE", "REUNION", "RENDEZ_VOUS"] as EventType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        type === t
                          ? TYPE_COLORS[t]
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Titre (non-visite) */}
              {type !== "VISITE" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="titre"
                    required
                    placeholder={type === "REUNION" ? "Ex: Réunion d'équipe" : "Ex: Rendez-vous notaire"}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              )}

              {/* Prospect (visite obligatoire, rdv optionnel) */}
              {(type === "VISITE" || type === "RENDEZ_VOUS") && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Prospect {type === "VISITE" && <span className="text-red-500">*</span>}
                    {type === "RENDEZ_VOUS" && <span className="text-gray-400 text-xs ml-1">(optionnel)</span>}
                  </label>
                  {prospects.length === 0 ? (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-600">
                      Aucun prospect — créez-en un dans l&apos;onglet Clients.
                    </p>
                  ) : (
                    <select
                      name="prospect_id"
                      required={type === "VISITE"}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">Sélectionner…</option>
                      {prospects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.prenom} {p.nom}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Bien (visite uniquement) */}
              {type === "VISITE" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Bien <span className="text-red-500">*</span>
                  </label>
                  {biens.length === 0 ? (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-600">
                      Aucun bien disponible.
                    </p>
                  ) : (
                    <select
                      name="bien_id"
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">Sélectionner…</option>
                      {biens.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.titre} — {b.adresse}, {b.ville}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Date + Durée */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Date et heure <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="date_visite"
                    required
                    defaultValue={defaultDateTime}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Durée</label>
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

              {/* Notes */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Informations complémentaires…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-3 border-t border-gray-100 pt-4">
                <Button
                  type="submit"
                  loading={isPending}
                  disabled={type === "VISITE" && (prospects.length === 0 || biens.length === 0)}
                >
                  Ajouter l&apos;événement
                </Button>
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
