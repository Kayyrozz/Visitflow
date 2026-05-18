"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Headphones, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow, formatDateTime } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

type Message = {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_email: string;
  sender: "agent" | "admin";
  content: string;
  read_by_admin: boolean;
  created_at: string;
};

type Conversation = {
  agentId: string;
  agentName: string;
  agentEmail: string;
  lastMessage: string;
  lastSender: "agent" | "admin";
  lastAt: string;
  unread: number;
};

function buildConversations(messages: Message[]): Conversation[] {
  const map = new Map<string, Conversation>();

  for (const msg of messages) {
    const existing = map.get(msg.agent_id);
    const isNewer = !existing || msg.created_at > existing.lastAt;

    if (!existing) {
      map.set(msg.agent_id, {
        agentId: msg.agent_id,
        agentName: msg.agent_name,
        agentEmail: msg.agent_email,
        lastMessage: msg.content,
        lastSender: msg.sender,
        lastAt: msg.created_at,
        unread: msg.sender === "agent" && !msg.read_by_admin ? 1 : 0,
      });
    } else {
      if (isNewer) {
        existing.lastMessage = msg.content;
        existing.lastSender = msg.sender;
        existing.lastAt = msg.created_at;
      }
      if (msg.sender === "agent" && !msg.read_by_admin) {
        existing.unread += 1;
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}

export default function AdminSupportChat({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialMessages.length > 0 ? buildConversations(initialMessages)[0]?.agentId ?? null : null
  );
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const conversations = buildConversations(messages);
  const currentMessages = messages
    .filter((m) => m.agent_id === selectedId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const currentConv = conversations.find((c) => c.agentId === selectedId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length, selectedId]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (!selectedId) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.agent_id === selectedId && m.sender === "agent" && !m.read_by_admin
          ? { ...m, read_by_admin: true }
          : m
      )
    );
    // Fire and forget — update read_by_admin in DB
    fetch("/api/support/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: selectedId }),
    });
  }, [selectedId]);

  // Realtime — listen to all support messages
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-support-all")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendReply = async () => {
    const content = reply.trim();
    if (!content || sending || !currentConv) return;

    setSending(true);
    setReply("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      agent_id: currentConv.agentId,
      agent_name: currentConv.agentName,
      agent_email: currentConv.agentEmail,
      sender: "admin",
      content,
      read_by_admin: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    await fetch("/api/support/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: currentConv.agentId,
        agentName: currentConv.agentName,
        agentEmail: currentConv.agentEmail,
        content,
      }),
    });

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const handleReplyInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReply(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">
        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-600" />
        <p className="text-sm text-slate-500">Aucun message de support pour l&apos;instant.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      {/* Left — Conversations list */}
      <div className="w-72 shrink-0 border-r border-slate-800 flex flex-col">
        <div className="border-b border-slate-800 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Conversations ({conversations.length})
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.agentId}
              onClick={() => setSelectedId(conv.agentId)}
              className={`w-full border-b border-slate-800/60 px-4 py-3 text-left transition-colors hover:bg-slate-800 ${
                selectedId === conv.agentId ? "bg-slate-800" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
                  {getInitials(conv.agentName)}
                  {conv.unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-sm font-medium text-white">{conv.agentName}</p>
                    <span className="shrink-0 text-[10px] text-slate-500">
                      {formatDistanceToNow(conv.lastAt)}
                    </span>
                  </div>
                  <p className={`mt-0.5 truncate text-xs ${
                    conv.unread > 0 ? "font-medium text-slate-300" : "text-slate-500"
                  }`}>
                    {conv.lastSender === "admin" ? "Vous : " : ""}{conv.lastMessage}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right — Chat view */}
      {selectedId && currentConv ? (
        <div className="flex flex-1 flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
              {getInitials(currentConv.agentName)}
            </div>
            <div>
              <p className="font-medium text-white">{currentConv.agentName}</p>
              <a href={`mailto:${currentConv.agentEmail}`} className="text-xs text-blue-400 hover:underline">
                {currentConv.agentEmail}
              </a>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {currentMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                {msg.sender === "agent" && (
                  <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white self-end">
                    {getInitials(msg.agent_name)}
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === "admin"
                    ? "rounded-br-sm bg-blue-600 text-white"
                    : "rounded-bl-sm bg-slate-800 text-slate-100"
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`mt-1 text-right text-[10px] ${
                    msg.sender === "admin" ? "text-blue-200" : "text-slate-500"
                  }`}>
                    {formatDateTime(msg.created_at)}
                  </p>
                </div>
                {msg.sender === "admin" && (
                  <div className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 self-end">
                    <Headphones className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Reply input */}
          <div className="border-t border-slate-800 px-4 py-3">
            <div className="flex items-end gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 focus-within:border-blue-500">
              <textarea
                ref={textareaRef}
                value={reply}
                onChange={handleReplyInput}
                onKeyDown={handleKeyDown}
                placeholder="Répondre… (Entrée pour envoyer)"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                style={{ minHeight: "24px", maxHeight: "120px" }}
              />
              <button
                onClick={sendReply}
                disabled={!reply.trim() || sending}
                className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-slate-600">
          Sélectionnez une conversation
        </div>
      )}
    </div>
  );
}
