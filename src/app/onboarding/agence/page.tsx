"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, MapPin, Phone, Mail } from "lucide-react";

export default function OnboardingAgencePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nom: "",
    adresse: "",
    ville: "",
    code_postal: "",
    telephone: "",
    email: "",
  });

  const field = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/onboarding/agence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(data.error ?? "Une erreur est survenue.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Créez votre agence
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Dernière étape avant d'accéder à votre dashboard VisitFlow
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="h-2 w-8 rounded-full bg-brand-600" />
          <div className="h-2 w-8 rounded-full bg-brand-600" />
          <div className="h-2 w-8 rounded-full bg-brand-600" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5 dark:border-gray-700 dark:bg-gray-900"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Nom de l'agence */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom de l'agence <span className="text-red-500">*</span>
            </label>
            <input
              value={form.nom}
              onChange={field("nom")}
              required
              placeholder="Agence Immobilière Martin"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          {/* Adresse */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              <MapPin className="h-3.5 w-3.5 text-gray-400" />
              Adresse
            </label>
            <input
              value={form.adresse}
              onChange={field("adresse")}
              placeholder="12 rue de la Paix"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          {/* Ville + Code postal */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code postal
              </label>
              <input
                value={form.code_postal}
                onChange={field("code_postal")}
                placeholder="75001"
                maxLength={10}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ville
              </label>
              <input
                value={form.ville}
                onChange={field("ville")}
                placeholder="Paris"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* Téléphone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                Téléphone
              </label>
              <input
                type="tel"
                value={form.telephone}
                onChange={field("telephone")}
                placeholder="+33 1 00 00 00 00"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                Email agence
              </label>
              <input
                type="email"
                value={form.email}
                onChange={field("email")}
                placeholder="contact@agence.fr"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.nom.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              "Création en cours…"
            ) : (
              <>
                Accéder au dashboard
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-600">
          Vous pourrez modifier ces informations plus tard dans les paramètres.
        </p>
      </div>
    </div>
  );
}
