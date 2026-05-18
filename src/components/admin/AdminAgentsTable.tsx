"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateAgent, adminDeleteAgent, adminAssignAgentAgence } from "@/lib/admin-actions";

type Agent = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: "AGENT" | "MANAGER" | "ADMIN";
  actif: boolean;
  telephone: string | null;
  created_at: string;
  agence: { id: string; nom: string } | null;
  _count?: { visites: number; prospects: number };
};

type Agence = { id: string; nom: string };

const ROLE_COLORS = {
  ADMIN: "bg-red-900/40 text-red-300 border border-red-800",
  MANAGER: "bg-violet-900/40 text-violet-300 border border-violet-800",
  AGENT: "bg-slate-700/60 text-slate-300 border border-slate-600",
};

function getInitials(prenom: string, nom: string) {
  return `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
}

function EditModal({ agent, agences, onClose }: { agent: Agent; agences: Agence[]; onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState(agent.role);
  const [actif, setActif] = useState(agent.actif);
  const [agenceId, setAgenceId] = useState<string>(agent.agence?.id ?? "");

  const save = () => {
    setError(null);
    startTransition(async () => {
      try {
        const ops: Promise<void>[] = [adminUpdateAgent(agent.id, { role, actif })];
        const newAgenceId = agenceId === "" ? null : agenceId;
        if (newAgenceId !== (agent.agence?.id ?? null)) {
          ops.push(adminAssignAgentAgence(agent.id, newAgenceId));
        }
        await Promise.all(ops);
        onClose();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="font-semibold text-white">Modifier le compte</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="space-y-4 px-6 py-4">
          {error && (
            <div className="rounded-lg bg-red-900/40 px-4 py-2 text-sm text-red-300">{error}</div>
          )}

          <div className="flex items-center gap-3 rounded-lg bg-slate-800 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-sm font-medium text-white">
              {getInitials(agent.prenom, agent.nom)}
            </div>
            <div>
              <p className="font-medium text-white">{agent.prenom} {agent.nom}</p>
              <p className="text-xs text-slate-400">{agent.email}</p>
              <p className="text-xs text-slate-500">{agent.agence?.nom ?? <span className="text-amber-400">Sans agence</span>}</p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Agence</label>
            <select
              value={agenceId}
              onChange={(e) => setAgenceId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">— Sans agence —</option>
              {agences.map((ag) => (
                <option key={ag.id} value={ag.id}>{ag.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Rôle</label>
            <div className="flex gap-2">
              {(["AGENT", "MANAGER", "ADMIN"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    role === r ? ROLE_COLORS[r] : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Statut du compte</label>
            <button
              type="button"
              onClick={() => setActif(!actif)}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                actif
                  ? "bg-green-900/30 text-green-300 border border-green-800"
                  : "bg-red-900/30 text-red-300 border border-red-800"
              }`}
            >
              <span>{actif ? "Compte actif" : "Compte désactivé"}</span>
              <span className={`h-2 w-2 rounded-full ${actif ? "bg-green-400" : "bg-red-400"}`} />
            </button>
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

function DeleteModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");

  const del = () => {
    startTransition(async () => {
      try {
        await adminDeleteAgent(agent.id);
        onClose();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-red-900 bg-slate-900 shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-4">
          <h2 className="font-semibold text-red-400">Supprimer le compte</h2>
        </div>
        <div className="space-y-4 px-6 py-4">
          {error && (
            <div className="rounded-lg bg-red-900/40 px-4 py-2 text-sm text-red-300">{error}</div>
          )}
          <p className="text-sm text-slate-300">
            Vous êtes sur le point de supprimer définitivement le compte de{" "}
            <span className="font-medium text-white">{agent.prenom} {agent.nom}</span>.
            Cette action est <span className="text-red-400">irréversible</span>.
          </p>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Tapez <span className="font-mono text-white">{agent.email}</span> pour confirmer
            </label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={agent.email}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-3 border-t border-slate-800 pt-4">
            <button
              onClick={del}
              disabled={isPending || confirm !== agent.email}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
            >
              {isPending ? "Suppression…" : "Supprimer définitivement"}
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

export default function AdminAgentsTable({ agents, agences }: { agents: Agent[]; agences: Agence[] }) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [filterStatut, setFilterStatut] = useState<string>("ALL");
  const [editing, setEditing] = useState<Agent | null>(null);
  const [deleting, setDeleting] = useState<Agent | null>(null);

  const filtered = agents.filter((a) => {
    const matchSearch =
      !search ||
      `${a.prenom} ${a.nom} ${a.email} ${a.agence?.nom ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "ALL" || a.role === filterRole;
    const matchStatut =
      filterStatut === "ALL" ||
      (filterStatut === "ACTIF" && a.actif) ||
      (filterStatut === "INACTIF" && !a.actif);
    return matchSearch && matchRole && matchStatut;
  });

  return (
    <>
      {/* Filtres */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Rechercher par nom, email, agence…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">Tous les rôles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="AGENT">Agent</option>
        </select>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIF">Actifs</option>
          <option value="INACTIF">Désactivés</option>
        </select>
      </div>

      <p className="mb-3 text-xs text-slate-500">{filtered.length} compte{filtered.length > 1 ? "s" : ""}</p>

      {/* Table desktop */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-800 md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Agence</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Visites</th>
              <th className="px-4 py-3">Créé le</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((agent) => (
              <tr key={agent.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-medium text-white">
                      {getInitials(agent.prenom, agent.nom)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{agent.prenom} {agent.nom}</p>
                      <p className="text-xs text-slate-400">{agent.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {agent.agence?.nom ?? (
                    <span className="rounded-full bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-400 border border-amber-800/50">
                      Sans agence
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[agent.role]}`}>
                    {agent.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                    agent.actif
                      ? "bg-green-900/30 text-green-400"
                      : "bg-red-900/30 text-red-400"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${agent.actif ? "bg-green-400" : "bg-red-400"}`} />
                    {agent.actif ? "Actif" : "Désactivé"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {agent._count?.visites ?? 0}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(agent.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setEditing(agent)}
                      className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => setDeleting(agent)}
                      className="rounded-lg border border-red-900/60 px-3 py-1 text-xs text-red-400 hover:bg-red-900/20"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-600">Aucun résultat</div>
        )}
      </div>

      {/* Cards mobile */}
      <div className="space-y-3 md:hidden">
        {filtered.map((agent) => (
          <div key={agent.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-medium text-white">
                  {getInitials(agent.prenom, agent.nom)}
                </div>
                <div>
                  <p className="font-medium text-white">{agent.prenom} {agent.nom}</p>
                  <p className="text-xs text-slate-400">{agent.email}</p>
                  {agent.agence ? (
                    <p className="text-xs text-slate-500">{agent.agence.nom}</p>
                  ) : (
                    <span className="rounded-full bg-amber-900/30 px-1.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-800/50">
                      Sans agence
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[agent.role]}`}>
                  {agent.role}
                </span>
                <span className={`text-xs ${agent.actif ? "text-green-400" : "text-red-400"}`}>
                  {agent.actif ? "Actif" : "Désactivé"}
                </span>
              </div>
            </div>
            <div className="mt-3 flex gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setEditing(agent)}
                className="flex-1 rounded-lg border border-slate-700 py-1.5 text-xs text-slate-300"
              >
                Modifier
              </button>
              <button
                onClick={() => setDeleting(agent)}
                className="flex-1 rounded-lg border border-red-900/60 py-1.5 text-xs text-red-400"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && <EditModal agent={editing} agences={agences} onClose={() => setEditing(null)} />}
      {deleting && <DeleteModal agent={deleting} onClose={() => setDeleting(null)} />}
    </>
  );
}
