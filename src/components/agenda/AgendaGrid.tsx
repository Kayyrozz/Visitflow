"use client";

import { useState } from "react";
import NewEventModal from "@/components/agenda/NewEventModal";

type Prospect = { id: string; prenom: string; nom: string };
type Bien = { id: string; titre: string; adresse: string; ville: string };

type CalendarEvent = {
  id: string;
  type: "VISITE" | "REUNION" | "RENDEZ_VOUS";
  titre: string;
  date: Date;
  duree_minutes: number;
};

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8h–17h
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
const CELL_HEIGHT = 64; // px per hour (must match min-h in JSX)

const EVENT_STYLE: Record<CalendarEvent["type"], string> = {
  VISITE: "bg-brand-100 border-brand-400 text-brand-800",
  REUNION: "bg-violet-100 border-violet-400 text-violet-800",
  RENDEZ_VOUS: "bg-emerald-100 border-emerald-400 text-emerald-800",
};

const EVENT_LABEL: Record<CalendarEvent["type"], string> = {
  VISITE: "Visite",
  REUNION: "Réunion",
  RENDEZ_VOUS: "RDV",
};

export default function AgendaGrid({
  prospects,
  biens,
  events,
  weekStartDate,
}: {
  prospects: Prospect[];
  biens: Bien[];
  events: CalendarEvent[];
  weekStartDate: { year: number; month: number; day: number };
}) {
  const [selectedSlot, setSelectedSlot] = useState<{ dayIndex: number; hour: number } | null>(null);

  const getDefaultDateTime = (dayIndex: number, hour: number) => {
    const { year, month, day } = weekStartDate;
    const d = new Date(year, month - 1, day + dayIndex, hour, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
  };

  // Group events by dayIndex (0-4) and hour
  const getEventsForCell = (dayIndex: number, hour: number) => {
    const { year, month, day } = weekStartDate;
    const cellDay = new Date(year, month - 1, day + dayIndex);

    return events.filter((ev) => {
      const evDate = ev.date;
      const sameDay =
        evDate.getFullYear() === cellDay.getFullYear() &&
        evDate.getMonth() === cellDay.getMonth() &&
        evDate.getDate() === cellDay.getDate();
      return sameDay && evDate.getHours() === hour;
    });
  };

  return (
    <>
      <div className="divide-y divide-gray-100">
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-6">
            <div className="p-3 text-right text-xs text-gray-400">{hour}:00</div>
            {DAYS.map((day, dayIndex) => {
              const cellEvents = getEventsForCell(dayIndex, hour);
              return (
                <div
                  key={`${day}-${hour}`}
                  style={{ minHeight: CELL_HEIGHT }}
                  className="group relative cursor-pointer border-l border-gray-100 p-1 hover:bg-gray-50"
                  onClick={() => setSelectedSlot({ dayIndex, hour })}
                >
                  {cellEvents.length === 0 && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-brand-300 opacity-0 group-hover:opacity-100">
                      + Ajouter
                    </span>
                  )}
                  {cellEvents.map((ev) => {
                    const topOffset = (ev.date.getMinutes() / 60) * CELL_HEIGHT;
                    const height = Math.max(20, (ev.duree_minutes / 60) * CELL_HEIGHT - 2);
                    return (
                      <div
                        key={ev.id}
                        style={{ top: topOffset, height }}
                        className={`absolute left-1 right-1 overflow-hidden rounded border-l-2 px-1.5 py-0.5 text-xs leading-tight ${EVENT_STYLE[ev.type]}`}
                        onClick={(e) => e.stopPropagation()}
                        title={ev.titre}
                      >
                        <span className="font-medium">{EVENT_LABEL[ev.type]}</span>
                        <span className="ml-1 truncate opacity-80">{ev.titre}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedSlot !== null && (
        <NewEventModal
          prospects={prospects}
          biens={biens}
          defaultDateTime={getDefaultDateTime(selectedSlot.dayIndex, selectedSlot.hour)}
          isOpen={true}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </>
  );
}
