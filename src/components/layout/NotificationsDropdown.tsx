"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Calendar, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";

type Notif = {
  id: string;
  date_visite: string;
  prospect: { prenom: string; nom: string } | null;
  bien: { titre: string; ville: string } | null;
};

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    supabase
      .from("visites")
      .select(`id, date_visite, prospect:prospects(prenom, nom), bien:biens(titre, ville)`)
      .gte("date_visite", now.toISOString())
      .lte("date_visite", in48h.toISOString())
      .eq("statut", "PLANIFIEE")
      .order("date_visite", { ascending: true })
      .limit(10)
      .then(({ data }) => {
        if (data) {
          setNotifs(
            data.map((v) => ({
              id: v.id,
              date_visite: v.date_visite,
              prospect: Array.isArray(v.prospect) ? v.prospect[0] ?? null : v.prospect,
              bien: Array.isArray(v.bien) ? v.bien[0] ?? null : v.bien,
            }))
          );
        }
      });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <Bell className="h-5 w-5" />
        {notifs.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
            {notifs.length > 9 ? "9+" : notifs.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-xs rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:max-w-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Visites à venir (48h)</span>
            <button onClick={() => setIsOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-4 w-4" />
            </button>
          </div>

          {notifs.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Calendar className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400 dark:text-gray-500">Aucune visite dans les 48h</p>
            </div>
          ) : (
            <div className="max-h-72 divide-y divide-gray-50 overflow-y-auto dark:divide-gray-800">
              {notifs.map((n) => (
                <div key={n.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {n.prospect ? `${n.prospect.prenom} ${n.prospect.nom}` : "Prospect inconnu"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {n.bien ? `${n.bien.titre} · ${n.bien.ville}` : "Bien inconnu"}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-brand-600 dark:text-blue-400">
                    {formatDateTime(new Date(n.date_visite))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
