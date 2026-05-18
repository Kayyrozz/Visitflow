"use client";

import { useState } from "react";
import type { Subscription } from "@/lib/subscription";

type Props = {
  agentName: string;
  subscription: Subscription | null;
  trialDaysLeft: number;
};

export default function SubscribeClient({ agentName, subscription, trialDaysLeft }: Props) {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
      alert("Erreur lors de la redirection vers le paiement.");
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setPortalLoading(false);
      alert("Erreur lors de l'ouverture du portail.");
    }
  };

  const handleStartTrial = async () => {
    setTrialLoading(true);
    await fetch("/api/subscription/confirm-trial", { method: "POST" });
    window.location.href = "/dashboard";
  };

  const isExpired = subscription?.status === "trialing" && trialDaysLeft === 0;
  const isPastDue = subscription?.status === "past_due";
  const isCanceled = subscription?.status === "canceled" || subscription?.status === "unpaid";
  const hasStripe = !!subscription?.stripe_subscription_id;
  const isNewTrialing = subscription?.status === "trialing" && !subscription?.onboarded && trialDaysLeft > 0;
  const isOnboardedTrialing = subscription?.status === "trialing" && !!subscription?.onboarded && trialDaysLeft > 0;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      {/* Status banner */}
      {isExpired && (
        <div className="mb-8 rounded-xl border border-red-800 bg-red-900/20 px-5 py-4 text-sm text-red-300">
          Votre essai gratuit est terminé. Abonnez-vous pour continuer à utiliser VisitFlow.
        </div>
      )}
      {isPastDue && (
        <div className="mb-8 rounded-xl border border-amber-800 bg-amber-900/20 px-5 py-4 text-sm text-amber-300">
          Un paiement a échoué sur votre abonnement. Veuillez mettre à jour votre moyen de paiement.
        </div>
      )}
      {isCanceled && (
        <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/40 px-5 py-4 text-sm text-slate-300">
          Votre abonnement a été annulé. Réabonnez-vous pour retrouver l&apos;accès.
        </div>
      )}

      <div className="mb-8 text-center">
        <p className="text-slate-400">Bonjour {agentName}</p>
        <h1 className="mt-2 text-3xl font-bold">
          {isOnboardedTrialing ? "Passez à l'abonnement Pro" : "Accédez à VisitFlow"}
        </h1>
        {trialDaysLeft > 0 && (
          <p className="mt-2 text-brand-400">
            Il vous reste <span className="font-semibold">{trialDaysLeft} jour{trialDaysLeft > 1 ? "s" : ""}</span> d&apos;essai gratuit
          </p>
        )}
      </div>

      {/* Pricing card */}
      <div className="rounded-2xl border border-brand-700 bg-gray-900 shadow-2xl">
        <div className="border-b border-gray-800 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Plan Pro</p>
              <p className="mt-1 text-gray-400 text-sm">Tout ce qu&apos;il vous faut pour gérer vos visites</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">15 <span className="text-2xl text-gray-400">€</span></p>
              <p className="text-xs text-gray-500">/ mois · HT</p>
            </div>
          </div>
        </div>

        <ul className="space-y-3 px-8 py-6 text-sm text-gray-300">
          {[
            "Comptes rendus de visites illimités",
            "Gestion des prospects avec score de chaleur",
            "Agenda et planification intégrés",
            "Rapports et statistiques",
            "Accès multi-agences",
            "Support prioritaire",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <svg className="h-4 w-4 shrink-0 text-brand-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-800 px-8 py-6">
          {trialDaysLeft > 0 && (
            <p className="mb-3 text-center text-xs text-gray-500">
              {trialDaysLeft} jour{trialDaysLeft > 1 ? "s" : ""} gratuit restant · Aucun débit avant la fin de l&apos;essai
            </p>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading || trialLoading}
            className="w-full rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Redirection…"
              : trialDaysLeft > 0
              ? "Démarrer l'abonnement maintenant"
              : "S'abonner — 15 € / mois"}
          </button>

          {isNewTrialing && (
            <button
              onClick={handleStartTrial}
              disabled={trialLoading || loading}
              className="mt-3 w-full rounded-xl border border-gray-700 px-6 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-60"
            >
              {trialLoading
                ? "Chargement…"
                : `Continuer avec l'essai gratuit (${trialDaysLeft} jour${trialDaysLeft > 1 ? "s" : ""})`}
            </button>
          )}

          {isOnboardedTrialing && (
            <a
              href="/dashboard"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-700 px-6 py-2.5 text-sm text-gray-400 transition-colors hover:bg-gray-800"
            >
              Retourner au dashboard
            </a>
          )}

          {(isPastDue || hasStripe) && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="mt-3 w-full rounded-xl border border-gray-700 px-6 py-2.5 text-sm text-gray-400 transition-colors hover:bg-gray-800 disabled:opacity-60"
            >
              {portalLoading ? "Chargement…" : "Gérer mon abonnement"}
            </button>
          )}

          <p className="mt-4 text-center text-xs text-gray-600">
            Paiement sécurisé par Stripe · Annulation à tout moment
          </p>
        </div>
      </div>
    </div>
  );
}
