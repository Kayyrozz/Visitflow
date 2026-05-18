"use client";

import { useState } from "react";
import { formatDistanceToNow } from "@/lib/utils";

type SupportMessage = {
  id: string;
  agent_name: string;
  agent_email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  open:        { label: "Ouvert",      classes: "bg-amber-900/30 text-amber-300 border-amber-700/50" },
  in_progress: { label: "En cours",   classes: "bg-blue-900/30 text-blue-300 border-blue-700/50" },
  resolved:    { label: "Résolu",     classes: "bg-green-900/30 text-green-300 border-green-700/50" },
};

export default function AdminSupportTable({ messages: initial }: { messages: SupportMessage[] }) {
  const [messages, setMessages] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch("/api/support/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
    setUpdating(null);
  };

  if (messages.length === 0) {
    return (
      <p className="text-sm text-slate-600 py-4">Aucun message de support pour l&apos;instant.</p>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => {
        const isOpen = expanded === msg.id;
        const statusInfo = STATUS_LABELS[msg.status] ?? STATUS_LABELS.open;

        return (
          <div
            key={msg.id}
            className={`rounded-xl border bg-slate-900 transition-colors ${
              msg.status === "resolved" ? "border-slate-800 opacity-70" : "border-slate-700"
            }`}
          >
            {/* Header row */}
            <button
              className="w-full text-left px-5 py-4"
              onClick={() => setExpanded(isOpen ? null : msg.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusInfo.classes}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-sm font-semibold text-white truncate">{msg.subject}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-300">{msg.agent_name}</span>
                    <span>·</span>
                    <span>{msg.agent_email}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(msg.created_at)}</span>
                  </div>
                </div>
                <span className="text-slate-500 text-xs mt-1 shrink-0">{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="border-t border-slate-800 px-5 py-4 space-y-4">
                <div className="rounded-lg bg-slate-800/60 px-4 py-3">
                  <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Changer le statut :</span>
                  {Object.entries(STATUS_LABELS).map(([key, info]) => (
                    <button
                      key={key}
                      disabled={msg.status === key || updating === msg.id}
                      onClick={() => updateStatus(msg.id, key)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-opacity disabled:opacity-40 ${info.classes}`}
                    >
                      {info.label}
                    </button>
                  ))}
                  <a
                    href={`mailto:${msg.agent_email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                    className="ml-auto rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Répondre par email
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
