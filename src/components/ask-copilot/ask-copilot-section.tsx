"use client";

import { useRef, useState } from "react";
import {
  ArrowUp,
  Lightbulb,
  Mail,
  HelpCircle,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAppSession } from "@/components/auth/session-provider";
import { MarkdownContent } from "@/components/ui/markdown-content";

const prompts = [
  { icon: Lightbulb, label: "Explain a goal" },
  { icon: HelpCircle, label: "What should I ask?" },
  { icon: Mail, label: "Draft follow-up email" },
  { icon: FileText, label: "Summarize my documents" },
];

type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: string;
};

export function AskCopilotSection() {
  const { displayName, copy } = useAppSession();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello ${displayName}. I’m SustainBL Copilot for ${copy.programLabel}. Ask about goals, prep questions, or next steps — I can use excerpts from your uploaded SustainBL documents when they match.`,
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed || busy) return;

    setBusy(true);
    setError(null);
    const userTurn: ChatTurn = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setTurns((prev) => [...prev, userTurn]);
    setValue("");

    try {
      const history = [...turns, userTurn]
        .filter((t) => t.id !== "welcome")
        .map((t) => ({ role: t.role, content: t.content }));

      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Copilot request failed");
      }

      setTurns((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: json.reply || "No response.",
          meta:
            typeof json.sourcesUsed === "number"
              ? `Used ${json.sourcesUsed} document excerpt${json.sourcesUsed === 1 ? "" : "s"} · ${json.model || "model"}`
              : undefined,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white lg:min-h-screen">
      <div className="page-pad-x flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 py-4 sm:py-5">
        <div>
          <h1 className="font-headline text-2xl font-semibold sm:text-3xl">Your SustainBL Assistant</h1>
          <p className="mt-1 font-body text-sm italic text-on-surface-variant">
            Answers grounded in your SustainBL documents when relevant
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-secondary-container/50 px-3 py-1.5">
          <Sparkles size={14} className="text-secondary" />
          <span className="font-label text-xs font-semibold text-secondary">Document RAG</span>
        </div>
      </div>

      {error ? (
        <p className="page-pad-x mt-4 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      <div className="page-pad-x flex-1 space-y-6 overflow-y-auto py-6 sm:space-y-8 sm:py-8">
        {turns.map((turn) =>
          turn.role === "assistant" ? (
            <div key={turn.id} className="flex max-w-3xl gap-3 sm:gap-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-fixed sm:h-10 sm:w-10">
                <Sparkles className="text-primary" size={16} />
              </div>
              <div className="flex-1 pt-1">
                <MarkdownContent content={turn.content} />
                {turn.meta ? (
                  <p className="mt-2 text-xs text-on-surface-variant">{turn.meta}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <div key={turn.id} className="ml-auto flex max-w-3xl flex-row-reverse gap-3 sm:gap-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-highest sm:h-10 sm:w-10">
                <span className="text-xs font-bold text-on-surface-variant">You</span>
              </div>
              <div className="flex-1 pt-1 text-right">
                <div className="inline-block rounded-2xl bg-surface-container-low px-4 py-3 text-left text-sm text-on-surface sm:px-6 sm:py-4 sm:text-base">
                  {turn.content}
                </div>
              </div>
            </div>
          ),
        )}
        {busy ? (
          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <Loader2 className="animate-spin" size={16} />
            Thinking with your documents…
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 border-t border-outline-variant/20 bg-white page-pad-x py-4 sm:py-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {prompts.map(({ icon: IconCmp, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setValue(label)}
              className="flex items-center gap-2 rounded-full border border-outline-variant/50 px-3 py-1.5 text-xs font-medium transition-all hover:border-primary hover:text-primary sm:text-sm"
            >
              <IconCmp size={12} />
              {label}
            </button>
          ))}
        </div>
        <div className="relative mx-auto max-w-4xl">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(value);
              }
            }}
            rows={2}
            placeholder="Ask anything about your uploaded documents..."
            className="min-h-[72px] w-full resize-none rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-4 pr-16 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 sm:min-h-[88px] sm:px-5 sm:pr-20 sm:text-base"
          />
          <button
            type="button"
            disabled={busy || !value.trim()}
            onClick={() => void send(value)}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary transition-all active:scale-90 disabled:opacity-50"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
