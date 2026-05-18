"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Headphones } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";

type Message = {
  id: string;
  sender: "agent" | "admin";
  content: string;
  created_at: string;
};

export default function SupportChat({
  initialMessages,
  agentId,
  agentName,
}: {
  initialMessages: Message[];
  agentId: string;
  agentName: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`support-agent-${agentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `agent_id=eq.${agentId}`,
        },
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
  }, [agentId]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Optimistic insert
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      sender: "agent",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600">
          <Headphones className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">Support VisitFlow</p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">En ligne · répond sous 24h</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 mb-3 dark:bg-brand-950">
              <Headphones className="h-7 w-7 text-brand-500" />
            </div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Comment pouvons-nous vous aider ?</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              Envoyez votre premier message, nous répondons sous 24h.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "admin" && (
              <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 self-end">
                <Headphones className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.sender === "agent"
                  ? "rounded-br-sm bg-brand-600 text-white"
                  : "rounded-bl-sm bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              <p className={`mt-1 text-right text-[10px] ${
                msg.sender === "agent" ? "text-brand-200" : "text-gray-400 dark:text-gray-500"
              }`}>
                {formatDateTime(msg.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-end gap-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 dark:border-gray-600 dark:bg-gray-800">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message… (Entrée pour envoyer)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-gray-100"
            style={{ minHeight: "24px", maxHeight: "120px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-xs text-gray-400">
          Maj+Entrée pour sauter une ligne
        </p>
      </div>
    </div>
  );
}
