"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateSubscription } from "@/lib/admin-actions";

type SubRow = {
  id: string;
  agent_id: string;
  agent: { prenom: string; nom: string; email: string } | null;
  status: string;
  trial_end: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  updated_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  trialing: "bg-blue-900/30 text-blue-300 border-blue-800/50",
  active: "bg-green-900/30 text-green-300 border-green-800/50",
  manual_active: "bg-teal-900/30 text-teal-300 border-teal-800/50",
  past_due: "bg-amber-900/30 text-amber-300 border-amber-800/50",
  canceled: "bg-slate-800 text-slate-400 border-slate-700",
  unpaid: "bg-red-900/30 text-red-300 border-red-800/50",
};

const STATUS_LABELS: Record<string, string> = {
  trialing: "Essai",
  active: "Actif",
  manual_active: "Actif (manuel)",
  past_due: "Paiement en retard",
  canceled: "Annulé",
  unpaid: "Impayé",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR");
}

function EditSubModal({ sub, onClose }: { sub: SubRow; onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(sub.status);
  const [trialEnd, setTrialEnd] = useState(
    sub.trial_end ? sub.trial_end.slice(0, 10) : ""
  );

  const save = () => {
    setError(null);
    startTransition(async () => {
      try {
        await adminUpdateSubscription(sub.id, {
          status,
          trial_end: trialEnd ? new Date(trialEnd).toISOString() : undefined,
        });
        onClose();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  };

  const STATUSES = ["trialing", "active", "manual_active", "past_due", "canceled", "unpaid"] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="font-semibold text-white">Modifier l&apos;abonnement</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4 px-6 py-4">
          {error && (
            <div className="rounded-lg bg-red-900/40 px-4 py-2 text-sm text-red-300">{error}</div>
          )}

          <div className="rounded-lg bg-slate-800 p-3 text-sm">
            <p className="font-medium text-white">{sub.agent?.prenom} {sub.agent?.nom}</p>
            <p className="text-xs text-slate-400">{sub.agent?.email}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Statut</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    status === s
                      ? STATUS_STYLES[s]
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Fin de la période d&apos;essai</label>
            <input
              type="date"
              value={trialEnd}
              onChange={(e) => setTrialEnd(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 border-t border-slate-800 pt-4">
            <button
              onClick={save}
              disabled={isPending}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSubscriptionsTable({ subscriptions }: { subscriptions: SubRow[] }) {
  const [editing, setEditing] = useState<SubRow | null>(null);
  const [search, setSearch] = useState("");

  const filtered = subscriptions.filter((s) => {
    const term = search.toLowerCase();
    return (
      !search ||
      `${s.agent?.prenom} ${s.agent?.nom} ${s.agent?.email}`.toLowerCase().includes(term) ||
      s.status.includes(term)
    );
  });

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom, email, statut…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-800 md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Fin essai</th>
              <th className="px-4 py-3">Prochain débit</th>
              <th className="px-4 py-3">Stripe</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{sub.agent?.prenom} {sub.agent?.nom}</p>
                  <p className="text-xs text-slate-400">{sub.agent?.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[sub.status] ?? STATUS_STYLES.canceled}`}>
                    {STATUS_LABELS[sub.status] ?? sub.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{formatDate(sub.trial_end)}</td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {sub.cancel_at_period_end ? (
                    <span className="text-amber-400">Annulé en fin de période</span>
                  ) : (
                    formatDate(sub.current_period_end)
                  )}
                </td>
                <td className="px-4 py-3">
                  {sub.stripe_subscription_id ? (
                    <span className="font-mono text-xs text-slate-500">{sub.stripe_subscription_id.slice(0, 14)}…</span>
                  ) : (
                    <span className="text-xs text-slate-700">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditing(sub)}
                    className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-600">Aucun résultat</div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((sub) => (
          <div key={sub.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-white">{sub.agent?.prenom} {sub.agent?.nom}</p>
                <p className="text-xs text-slate-400">{sub.agent?.email}</p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[sub.status] ?? STATUS_STYLES.canceled}`}>
                {STATUS_LABELS[sub.status] ?? sub.status}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>Fin essai : {formatDate(sub.trial_end)}</div>
              <div>Prochain débit : {formatDate(sub.current_period_end)}</div>
            </div>
            <button
              onClick={() => setEditing(sub)}
              className="mt-3 w-full rounded-lg border border-slate-700 py-1.5 text-xs text-slate-300"
            >
              Modifier
            </button>
          </div>
        ))}
      </div>

      {editing && <EditSubModal sub={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
