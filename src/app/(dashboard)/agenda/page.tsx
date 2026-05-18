import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import NewEventModal from "@/components/agenda/NewEventModal";
import AgendaGrid from "@/components/agenda/AgendaGrid";

export const metadata: Metadata = { title: "Agenda" };

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
const WEEK_START = { year: 2026, month: 5, day: 13 };

export default async function AgendaPage() {
  const supabase = createClient();

  // Semaine du 13 au 17 mai 2026
  const weekFrom = new Date(2026, 4, 13, 0, 0, 0).toISOString();
  const weekTo = new Date(2026, 4, 17, 23, 59, 59).toISOString();

  const [
    { data: prospects },
    { data: biens },
    { data: visites },
    { data: evenements },
  ] = await Promise.all([
    supabase.from("prospects").select("id, prenom, nom").eq("statut", "ACTIF").order("nom"),
    supabase.from("biens").select("id, titre, adresse, ville").eq("statut", "DISPONIBLE").order("titre"),
    supabase
      .from("visites")
      .select("id, date_visite, duree_minutes, prospect:prospects(prenom, nom), bien:biens(titre)")
      .gte("date_visite", weekFrom)
      .lte("date_visite", weekTo)
      .neq("statut", "ANNULEE"),
    supabase
      .from("evenements")
      .select("id, titre, type, date_debut, duree_minutes")
      .gte("date_debut", weekFrom)
      .lte("date_debut", weekTo),
  ]);

  // Normalise visites + evenements en CalendarEvent[]
  type CalendarEvent = {
    id: string;
    type: "VISITE" | "REUNION" | "RENDEZ_VOUS";
    titre: string;
    date: Date;
    duree_minutes: number;
  };

  const events: CalendarEvent[] = [
    ...(visites ?? []).map((v) => {
      const prospect = v.prospect as { prenom: string; nom: string } | null;
      const bien = v.bien as { titre: string } | null;
      return {
        id: v.id,
        type: "VISITE" as const,
        titre: prospect ? `${prospect.prenom} ${prospect.nom} — ${bien?.titre ?? ""}` : (bien?.titre ?? "Visite"),
        date: new Date(v.date_visite),
        duree_minutes: v.duree_minutes,
      };
    }),
    ...(evenements ?? []).map((e) => ({
      id: e.id,
      type: e.type as "REUNION" | "RENDEZ_VOUS",
      titre: e.titre,
      date: new Date(e.date_debut),
      duree_minutes: e.duree_minutes,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500">Semaine du 13 au 17 mai 2026</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Légende */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border-l-2 border-brand-400 bg-brand-100" />
              Visite
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border-l-2 border-violet-400 bg-violet-100" />
              Réunion
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border-l-2 border-emerald-400 bg-emerald-100" />
              RDV
            </span>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
              ← Préc.
            </button>
            <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
              Aujourd&apos;hui
            </button>
            <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
              Suiv. →
            </button>
            <NewEventModal prospects={prospects ?? []} biens={biens ?? []} />
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-6 border-b border-gray-200">
            <div className="p-4" />
            {DAYS.map((day, i) => (
              <div
                key={day}
                className="border-l border-gray-200 p-4 text-center text-sm font-medium text-gray-700"
              >
                <div>{day}</div>
                <div className="text-lg font-semibold text-gray-900">{WEEK_START.day + i}</div>
              </div>
            ))}
          </div>

          <AgendaGrid
            prospects={prospects ?? []}
            biens={biens ?? []}
            events={events}
            weekStartDate={WEEK_START}
          />
        </div>
      </div>
    </div>
  );
}
