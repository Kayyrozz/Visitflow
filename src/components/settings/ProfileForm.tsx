"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setName(user.user_metadata?.name ?? "");
        setEmail(user.email ?? "");
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { name },
    });
    setSaving(false);
    setMessage(error ? { type: "error", text: "Erreur lors de la sauvegarde." } : { type: "success", text: "Profil mis à jour." });
  };

  const prenom = name.split(" ")[0] ?? "";
  const nom = name.split(" ").slice(1).join(" ");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 font-semibold text-gray-900">Profil</h2>
      {message && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setName(`${e.target.value} ${nom}`.trim())}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setName(`${prenom} ${e.target.value}`.trim())}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">L'email ne peut pas être modifié ici.</p>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}
