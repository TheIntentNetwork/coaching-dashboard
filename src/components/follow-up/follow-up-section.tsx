"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { useAppSession } from "@/components/auth/session-provider";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import type { MessageThreadSummary, SecureMessage } from "@/lib/portal/types";
import {
  useMessageThreadQuery,
  useMessagesQuery,
  useSendMessageMutation,
} from "@/lib/portal/query/hooks/use-messages";
import { portalKeys } from "@/lib/portal/query/query-keys";

function formatMessageTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function FollowUpSection() {
  const { copy } = useAppSession();
  const noun = copy.coachNoun;
  const qc = useQueryClient();
  const threadsQuery = useMessagesQuery();
  const sendMutation = useSendMessageMutation();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const threads = (threadsQuery.data?.threads || []) as MessageThreadSummary[];

  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId]);

  const threadQuery = useMessageThreadQuery(activeThreadId);
  const messages = (threadQuery.data?.messages || []) as SecureMessage[];

  useEffect(() => {
    if (!activeThreadId || !threadQuery.isSuccess) return;
    qc.setQueryData(
      portalKeys.messages(),
      (prev: { threads?: MessageThreadSummary[] } | undefined) => {
        if (!prev?.threads) return prev;
        return {
          ...prev,
          threads: prev.threads.map((t) =>
            t.id === activeThreadId ? { ...t, unreadCount: 0 } : t,
          ),
        };
      },
    );
  }, [activeThreadId, threadQuery.isSuccess, qc]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const loading = threadsQuery.isPending && !threadsQuery.data;
  const sending = sendMutation.isPending;
  const error =
    localError ||
    threadsQuery.error?.message ||
    threadQuery.error?.message ||
    sendMutation.error?.message ||
    null;

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;
  let consecutiveClient = 0;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].sender_type !== "veteran") break;
    consecutiveClient += 1;
  }
  const atMessageLimit = consecutiveClient >= 2;
  const waitingForAdvocate = consecutiveClient > 0;

  async function sendMessage() {
    const body = draft.trim();
    if (!body || atMessageLimit) return;
    setLocalError(null);
    try {
      const json = await sendMutation.mutateAsync({
        threadId: activeThreadId,
        body,
      });
      setDraft("");
      const threadId =
        activeThreadId ||
        ((json as { thread?: { id?: string } }).thread?.id as string | undefined);
      if (threadId && !activeThreadId) setActiveThreadId(threadId);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to send message");
    }
  }

  return (
    <PageShell width="narrow" className="pb-16 sm:pb-20">
      <PageHeader
        title="Messages"
        description={`Message your ${noun} directly to close the loop after meetings, ask questions, or share updates.`}
      />

      {error ? (
        <p className="mb-6 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-3 py-16 text-on-surface-variant">
          <Loader2 className="animate-spin" size={18} />
          Loading messages…
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-soft">
          <div className="flex items-center justify-between border-b border-outline-variant/30 px-4 py-4 sm:px-6 sm:py-5">
            <div>
              <p className="font-headline text-lg text-on-surface sm:text-xl">
                {activeThread?.advisorName ||
                  `Your ${noun.charAt(0).toUpperCase()}${noun.slice(1)}`}
              </p>
              <p className="text-xs text-on-surface-variant">
                {activeThread?.subject || `Message to your ${noun}`}
              </p>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="max-h-[28rem] space-y-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
          >
            {messages.length === 0 ? (
              <p className="text-sm italic text-on-surface-variant">
                No messages yet. Send the first message to your {noun} below.
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender_type === "veteran" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-md sm:px-5 ${
                      m.sender_type === "veteran"
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.message_body}</p>
                    <p
                      className={`mt-1 text-[10px] uppercase tracking-wider ${
                        m.sender_type === "veteran"
                          ? "text-on-primary/70"
                          : "text-on-surface-variant/60"
                      }`}
                    >
                      {formatMessageTime(m.sent_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {waitingForAdvocate ? (
            <div className="border-t border-outline-variant/30 bg-surface-container-low px-4 py-3 sm:px-6">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                {atMessageLimit
                  ? `Waiting for ${noun} response (2-message limit)`
                  : `Waiting for ${noun} response · ${2 - consecutiveClient} message left`}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-outline-variant/30 px-4 py-4 sm:flex-row sm:items-end sm:px-6 sm:py-5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!atMessageLimit) void sendMessage();
                }
              }}
              placeholder={
                atMessageLimit
                  ? `Wait for your ${noun} to reply before sending more…`
                  : `Write a message to your ${noun}…`
              }
              rows={2}
              disabled={atMessageLimit}
              className="w-full flex-1 resize-none rounded-lg border border-outline-variant/50 bg-transparent px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              type="button"
              disabled={sending || !draft.trim() || atMessageLimit}
              onClick={() => void sendMessage()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-on-primary shadow-soft transition-all active:scale-95 disabled:opacity-60 sm:w-auto"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Send
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
