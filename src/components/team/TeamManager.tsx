"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Users, Phone, Mail, Copy, Check, Shield, User } from "lucide-react";
import { createTeamMember, updateTeamMember, removeTeamMember } from "@/lib/team-actions";
import { getInitials } from "@/lib/utils";

type Member = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  role: "AGENT" | "MANAGER" | "ADMIN";
  actif: boolean;
  created_at: string;
};

const ROLE_CONFIG = {
  ADMIN:   { label: "Admin",   color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  MANAGER: { label: "Manager", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
  AGENT:   { label: "Agent",   color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

// ─── Add member modal ────────────────────────────────────────────────────────

function AddMemberModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", telephone: "", role: "AGENT" as "AGENT" | "MANAGER",
  });

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const { tempPassword } = await createTeamMember(form);
        setCreated({ name: `${form.prenom} ${form.nom}`, email: form.email, password: tempPassword });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inattendue");
      }
    });
  };

  const copyPassword = () => {
    if (!created) return;
    navigator.clipboard.writeText(
      `Email : ${created.email}\nMot de passe : ${created.password}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {created ? "Compte créé !" : "Ajouter un membre"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            ✕
          </button>
        </div>

        {/* Success state */}
        {created ? (
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Compte créé pour {created.name}
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                  Communiquez ces identifiants à votre collaborateur
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Email</span>
                <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{created.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Mot de passe temporaire</span>
                <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{created.password}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Le collaborateur pourra changer son mot de passe depuis ses paramètres après connexion.
            </p>

            <div className="flex gap-3 pt-1">
              <button
                onClick={copyPassword}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copié !" : "Copier les identifiants"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Prénom *</label>
                <input
                  value={form.prenom}
                  onChange={field("prenom")}
                  required
                  placeholder="Jean"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Nom *</label>
                <input
                  value={form.nom}
                  onChange={field("nom")}
                  required
                  placeholder="Dupont"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={field("email")}
                required
                placeholder="jean.dupont@agence.fr"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={field("telephone")}
                placeholder="+33 6 00 00 00 00"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Rôle *</label>
              <div className="grid grid-cols-2 gap-2">
                {(["AGENT", "MANAGER"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r }))}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      form.role === r
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950/50 dark:text-brand-300"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {r === "MANAGER" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    {r === "MANAGER" ? "Manager" : "Agent"}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-500">
                {form.role === "MANAGER"
                  ? "Peut ajouter et gérer les membres de l'équipe"
                  : "Accès standard au dashboard et aux données"}
              </p>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {isPending ? "Création…" : "Créer le compte"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Edit member modal ───────────────────────────────────────────────────────

function EditMemberModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"AGENT" | "MANAGER">(
    member.role === "ADMIN" ? "MANAGER" : member.role
  );
  const [actif, setActif] = useState(member.actif);
  const [showRemove, setShowRemove] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  const save = () => {
    setError(null);
    startTransition(async () => {
      try {
        await updateTeamMember(member.id, { role, actif });
        onClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      }
    });
  };

  const remove = () => {
    startTransition(async () => {
      try {
        await removeTeamMember(member.id);
        onClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {showRemove ? "Supprimer le membre" : "Modifier le membre"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Member info */}
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {getInitials(`${member.prenom} ${member.nom}`)}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{member.prenom} {member.nom}</p>
              <p className="text-xs text-gray-500">{member.email}</p>
            </div>
          </div>

          {!showRemove ? (
            <>
              {/* Role */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">Rôle</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["AGENT", "MANAGER"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      disabled={member.role === "ADMIN"}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${
                        role === r
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950/50 dark:text-brand-300"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {r === "MANAGER" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      {r === "MANAGER" ? "Manager" : "Agent"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">Statut du compte</label>
                <button
                  type="button"
                  onClick={() => setActif(!actif)}
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    actif
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                  }`}
                >
                  <span>{actif ? "Compte actif" : "Compte désactivé"}</span>
                  <span className={`h-2 w-2 rounded-full ${actif ? "bg-green-500" : "bg-red-500"}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowRemove(true)}
                  className="rounded-xl border border-red-200 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Supprimer
                </button>
                <button
                  onClick={save}
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {isPending ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Le compte de <span className="font-medium text-gray-900 dark:text-white">{member.prenom} {member.nom}</span> sera définitivement supprimé. Cette action est irréversible.
              </p>
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Tapez <span className="font-mono text-gray-800 dark:text-gray-200">{member.email}</span> pour confirmer
                </label>
                <input
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={member.email}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setShowRemove(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={remove}
                  disabled={isPending || confirmEmail !== member.email}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40"
                >
                  {isPending ? "Suppression…" : "Supprimer"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Member card ─────────────────────────────────────────────────────────────

function MemberCard({
  member,
  isSelf,
  canManage,
  onEdit,
}: {
  member: Member;
  isSelf: boolean;
  canManage: boolean;
  onEdit: () => void;
}) {
  const roleInfo = ROLE_CONFIG[member.role];

  return (
    <div className={`group relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900 ${
      isSelf ? "border-brand-300 dark:border-brand-700" : "border-gray-200 dark:border-gray-700"
    }`}>
      {isSelf && (
        <span className="absolute right-3 top-3 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          Vous
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-base font-semibold text-white">
          {getInitials(`${member.prenom} ${member.nom}`)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 dark:text-white truncate">
            {member.prenom} {member.nom}
          </p>
          <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleInfo.color}`}>
            {roleInfo.label}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{member.email}</span>
        </div>
        {member.telephone && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{member.telephone}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${member.actif ? "bg-green-500" : "bg-gray-400"}`} />
          <span className={`text-xs font-medium ${member.actif ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
            {member.actif ? "Actif" : "Désactivé"}
          </span>
        </div>
        {canManage && !isSelf && (
          <button
            onClick={onEdit}
            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-500 dark:hover:text-brand-400"
          >
            Modifier
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function TeamManager({
  members,
  agenceName,
  currentAgentId,
  canManage,
}: {
  members: Member[];
  agenceName: string;
  currentAgentId: string;
  canManage: boolean;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const active = members.filter((m) => m.actif);
  const inactive = members.filter((m) => !m.actif);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Équipe</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {agenceName} · {members.length} membre{members.length > 1 ? "s" : ""}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter un membre
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
          <p className="mt-0.5 text-xs text-gray-500">Membres total</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{active.length}</p>
          <p className="mt-0.5 text-xs text-gray-500">Actifs</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {members.filter((m) => m.role === "MANAGER").length}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">Managers</p>
        </div>
      </div>

      {/* Members grid */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-900">
          <Users className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="font-medium text-gray-400">Aucun membre dans l&apos;équipe</p>
          {canManage && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Inviter le premier membre
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active members */}
          <div>
            {inactive.length > 0 && (
              <h2 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Membres actifs ({active.length})
              </h2>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {active.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  isSelf={m.id === currentAgentId}
                  canManage={canManage}
                  onEdit={() => setEditing(m)}
                />
              ))}
            </div>
          </div>

          {/* Inactive members */}
          {inactive.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-gray-400">
                Désactivés ({inactive.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-60">
                {inactive.map((m) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    isSelf={m.id === currentAgentId}
                    canManage={canManage}
                    onEdit={() => setEditing(m)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} />}
      {editing && <EditMemberModal member={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
