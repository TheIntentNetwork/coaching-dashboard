"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, ChevronRight, Clock, Loader2, Sparkles, User } from "lucide-react";
import type { PortalMeetingDetail } from "@/lib/portal/types";

type QuestionAnswer = { question: string; answer: string | null };
type Note = { title: string | null; body: string };
type ChecklistItem = { label: string; checked: boolean };

function toQuestions(value: unknown): QuestionAnswer[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry): QuestionAnswer | null => {
      if (typeof entry === "string") return { question: entry, answer: null };
      if (entry && typeof entry === "object") {
        const obj = entry as Record<string, unknown>;
        const question = obj.question ?? obj.q ?? obj.title;
        if (!question) return null;
        const answer = obj.answer ?? obj.a ?? null;
        return { question: String(question), answer: answer ? String(answer) : null };
      }
      return null;
    })
    .filter((v): v is QuestionAnswer => v !== null);
}

function toNotes(value: unknown): Note[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry): Note | null => {
      if (typeof entry === "string") return { title: null, body: entry };
      if (entry && typeof entry === "object") {
        const obj = entry as Record<string, unknown>;
        const body = obj.body ?? obj.note ?? obj.text;
        if (!body) return null;
        return { title: obj.title ? String(obj.title) : null, body: String(body) };
      }
      return null;
    })
    .filter((v): v is Note => v !== null);
}

function toChecklist(value: unknown): ChecklistItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry): ChecklistItem | null => {
      if (typeof entry === "string") return { label: entry, checked: false };
      if (entry && typeof entry === "object") {
        const obj = entry as Record<string, unknown>;
        const label = obj.label ?? obj.title ?? obj.text;
        if (!label) return null;
        return { label: String(label), checked: Boolean(obj.checked) };
      }
      return null;
    })
    .filter((v): v is ChecklistItem => v !== null);
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function MeetingDetailSection({ id }: { id: string }) {
  const [meeting, setMeeting] = useState<PortalMeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/portal/meetings/${id}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) setError(json.error || "Failed to load meeting");
        else setMeeting(json.meeting);
      } catch {
        if (!cancelled) setError("Failed to load meeting");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-16 text-on-surface-variant sm:px-6 sm:py-24 lg:px-12">
        <Loader2 className="animate-spin" size={20} />
        Loading meeting…
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-12">
        <p className="mb-4 text-on-surface-variant">{error || "Meeting not found."}</p>
        <Link href="/meetings" className="font-bold text-primary hover:underline">
          Back to meetings
        </Link>
      </div>
    );
  }

  const title = meeting.appointmentType || meeting.purpose || "Meeting";
  const questions = toQuestions(meeting.summary?.questions_json);
  const notes = toNotes(meeting.summary?.notes_json);
  const checklist = toChecklist(meeting.summary?.checklist_json);

  return (
    <div className="page-pad mx-auto max-w-4xl pb-16">
      <nav className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-on-surface-variant">
        <Link href="/meetings" className="hover:text-primary">
          Meetings
        </Link>
        <ChevronRight size={12} />
        <span className="truncate text-on-surface">{title}</span>
      </nav>

      <header className="mb-8 sm:mb-12">
        <h1 className="page-title mb-2 font-medium">{title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant sm:gap-4">
          <span className="flex items-center gap-1">
            <Calendar size={14} /> {formatDateLabel(meeting.startTime)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {meeting.durationMinutes} minutes
          </span>
          {meeting.advisorName ? (
            <span className="flex items-center gap-1">
              <User size={14} /> {meeting.advisorName}
            </span>
          ) : null}
        </div>
      </header>

      {meeting.summary?.summary_markdown ? (
        <section className="mb-10 sm:mb-16">
          <div className="mb-4 flex items-center gap-2 sm:mb-6">
            <Sparkles className="text-primary" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">AI Summary</h2>
          </div>
          <p className="max-w-3xl whitespace-pre-wrap font-headline text-lg italic leading-relaxed text-on-surface sm:text-xl">
            {meeting.summary.summary_markdown}
          </p>
        </section>
      ) : (
        <section className="mb-10 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5 sm:mb-16 sm:p-8">
          <p className="text-on-surface-variant">
            No summary has been added for this meeting yet. Your advocate will share notes here once
            it&apos;s available.
          </p>
        </section>
      )}

      {questions.length > 0 ? (
        <section className="mb-10 sm:mb-16">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-on-surface-variant sm:mb-8">
            Questions & Discussion
          </h2>
          <div className="divide-y divide-outline-variant/40">
            {questions.map((item, i) => (
              <div
                key={`${item.question}-${i}`}
                className="flex flex-col gap-4 py-6 md:flex-row md:items-start md:gap-12"
              >
                <div className="md:w-1/3">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-tighter text-on-surface-variant">
                    The Question
                  </h3>
                  <p className="font-semibold leading-snug text-on-surface">{item.question}</p>
                </div>
                {item.answer ? (
                  <div className="md:w-2/3">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-tighter text-on-surface-variant">
                      What you said
                    </h3>
                    <p className="leading-relaxed text-on-surface-variant">{item.answer}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {notes.length > 0 ? (
        <section>
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-on-surface-variant sm:mb-8">
            AI Captured Notes
          </h2>
          <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:gap-y-8 md:grid-cols-2">
            {notes.map((n, i) => (
              <div key={`${n.body}-${i}`} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div>
                  {n.title ? <p className="mb-1 font-bold text-on-surface">{n.title}</p> : null}
                  <p className="text-sm leading-relaxed text-on-surface-variant">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {checklist.length > 0 ? (
        <section className="mt-10 sm:mt-16">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-on-surface-variant sm:mb-8">
            Checklist
          </h2>
          <div className="space-y-3">
            {checklist.map((c, i) => (
              <div key={`${c.label}-${i}`} className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    c.checked ? "border-primary bg-primary" : "border-outline-variant/60"
                  }`}
                />
                <p className={c.checked ? "text-on-surface-variant line-through" : "text-on-surface"}>
                  {c.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
