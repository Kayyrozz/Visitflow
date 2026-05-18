"use client";

import { useState, useMemo } from "react";
import { Search, Building2, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProspectWithHeat } from "@/lib/supabase/queries/prospects";
import type { Bien } from "@/types/database";
import ProspectHeatCard from "./ProspectHeatCard";
import ProspectDetailPanel from "./ProspectDetailPanel";
import { getHeatLevel } from "./HeatBadge";

type HeatFilter = "all" | "chaud" | "tiede" | "froid";

const heatFilters: {
  value: HeatFilter;
  label: string;
  activeClass: string;
}[] = [
  {
    value: "all",
    label: "Tous",
    activeClass:
      "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100",
  },
  {
    value: "chaud",
    label: "🔥 Chaud",
    activeClass: "bg-red-500 text-white border-red-500",
  },
  {
    value: "tiede",
    label: "🌡 Tiède",
    activeClass: "bg-amber-400 text-white border-amber-400",
  },
  {
    value: "froid",
    label: "❄ Froid",
    activeClass: "bg-blue-500 text-white border-blue-500",
  },
];

interface ProspectHeatListProps {
  initialProspects: ProspectWithHeat[];
  biens: Bien[];
}

export default function ProspectHeatList({
  initialProspects,
  biens,
}: ProspectHeatListProps) {
  const [search, setSearch] = useState("");
  const [bienFilter, setBienFilter] = useState<string>("");
  const [heatFilter, setHeatFilter] = useState<HeatFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialProspects[0]?.id ?? null
  );

  const counts = useMemo(
    () => ({
      chaud: initialProspects.filter(
        (p) => getHeatLevel(p.heatScore) === "chaud"
      ).length,
      tiede: initialProspects.filter(
        (p) => getHeatLevel(p.heatScore) === "tiede"
      ).length,
      froid: initialProspects.filter(
        (p) => getHeatLevel(p.heatScore) === "froid"
      ).length,
    }),
    [initialProspects]
  );

  const filtered = useMemo(() => {
    return initialProspects
      .filter((p) => {
        if (search) {
          const q = search.toLowerCase();
          const fullName = `${p.prenom} ${p.nom}`.toLowerCase();
          if (
            !fullName.includes(q) &&
            !p.email?.toLowerCase().includes(q) &&
            !(p.telephone ?? "").includes(q)
          ) {
            return false;
          }
        }
        if (bienFilter) {
          const hasVisitedBien = p.visites.some((v) => v.bien?.id === bienFilter);
          if (!hasVisitedBien) return false;
        }
        if (heatFilter !== "all") {
          const level = getHeatLevel(p.heatScore);
          if (level !== heatFilter) return false;
        }
        return true;
      })
      .sort((a, b) => (b.heatScore ?? -1) - (a.heatScore ?? -1));
  }, [initialProspects, search, bienFilter, heatFilter]);

  const selectedProspect =
    initialProspects.find((p) => p.id === selectedId) ?? null;

  const resetFilters = () => {
    setSearch("");
    setBienFilter("");
    setHeatFilter("all");
  };

  const hasActiveFilters = search !== "" || bienFilter !== "" || heatFilter !== "all";

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filters bar ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
        {/* Search */}
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un prospect…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm placeholder-gray-400 transition-colors focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-800 dark:focus:ring-blue-500/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Bien filter */}
        <div className="relative">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={bienFilter}
            onChange={(e) => setBienFilter(e.target.value)}
            className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm text-gray-700 transition-colors focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500"
          >
            <option value="">Tous les biens</option>
            {biens.map((b) => (
              <option key={b.id} value={b.id}>
                {b.titre} — {b.ville}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Heat filter pills */}
        <div className="flex gap-1.5">
          {heatFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setHeatFilter(f.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                heatFilter === f.value
                  ? f.activeClass
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700"
              )}
            >
              {f.label}
              {f.value !== "all" && (
                <span className="ml-1 opacity-75">
                  ({counts[f.value as keyof typeof counts]})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X className="h-3.5 w-3.5" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Prospect list */}
        <div className="flex flex-col gap-2 lg:col-span-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-14 text-center dark:border-gray-700 dark:bg-gray-900">
              <Users className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                Aucun prospect trouvé
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-2 text-xs text-brand-500 hover:underline dark:text-blue-400"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="px-1 text-xs text-gray-400">
                {filtered.length} prospect{filtered.length !== 1 ? "s" : ""}
                {hasActiveFilters ? " (filtré)" : ""}
                {" · "}trié par score décroissant
              </p>
              {filtered.map((prospect) => (
                <ProspectHeatCard
                  key={prospect.id}
                  prospect={prospect}
                  isSelected={selectedId === prospect.id}
                  onClick={() => setSelectedId(prospect.id)}
                />
              ))}
            </>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {selectedProspect ? (
            <div
              className="sticky top-0"
              style={{ maxHeight: "calc(100vh - 13rem)" }}
            >
              <ProspectDetailPanel prospect={selectedProspect} />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Sélectionnez un prospect pour voir sa fiche
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
