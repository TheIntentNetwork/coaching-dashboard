"use client";

import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Clock,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { MeetingJoinActions } from "@/components/meetings/meeting-join-actions";
import { formatMeetingTitle } from "@/lib/portal/meeting-types";
import type { PortalMeetingDetail } from "@/lib/portal/types";
import { useMeetingDetailQuery } from "@/lib/portal/query/hooks/use-meetings";

function canShowJoinActions(meeting: PortalMeetingDetail) {
  return meeting.status === "scheduled" || meeting.status === "in_progress";
}

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
  const meetingQuery = useMeetingDetailQuery(id);
  const meeting = meetingQuery.data?.meeting ?? null;
  const loading = meetingQuery.isPending && !meetingQuery.data;
  const error = meetingQuery.error?.message || null;

  if (loading) {
    return (
      <PageShell className="flex items-center gap-3 py-16 text-on-surface-variant">
        <Loader2 className="animate-spin" size={20} />
        Loading meeting…
      </PageShell>
    );
  }

  if (error || !meeting) {
    return (
      <PageShell className="py-16 text-center">
        <p className="mb-4 text-on-surface-variant">{error || "Meeting not found."}</p>
        <Link href="/meetings" className="font-bold text-primary hover:underline">
          Back to meetings
        </Link>
      </PageShell>
    );
  }

  const title = formatMeetingTitle(meeting.appointmentType, meeting.purpose);
  const questions = toQuestions(meeting.summary?.questions_json);
  const notes = toNotes(meeting.summary?.notes_json);
  const checklist = toChecklist(meeting.summary?.checklist_json);
  const showJoin = canShowJoinActions(meeting);

  return (
    <PageShell className="pb-16">
      <nav className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
        <Link href="/meetings" className="hover:text-primary">
          Meetings
        </Link>
        <ChevronRight size={12} />
        <span className="truncate text-on-surface">{title}</span>
      </nav>

      <header className="mb-8 sm:mb-10">
        <h1 className="page-title font-normal">{title}</h1>
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

        {showJoin ? (
          <div className="mt-6 space-y-2">
            <MeetingJoinActions
              copilotJoinUrl={meeting.meetingLink}
              thirdPartyJoinUrl={meeting.thirdPartyJoinUrl}
              thirdPartyLabel={meeting.thirdPartyLabel}
              layout="row"
            />
            <p className="text-sm text-on-surface-variant">
              Use SustainBL Copilot for AI-assisted video, or join via Zoom/Google
              Meet if your advocate shared an external link.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-on-surface-variant">
            This was a remote video meeting. Recording may be available from your
            advocate after the session.
          </p>
        )}
      </header>

      {meeting.summary?.summary_markdown ? (
        <section className="mb-10 sm:mb-16">
          <div className="mb-4 flex items-center gap-2 sm:mb-6">
            <Sparkles className="text-primary" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
              Meeting summary
            </h2>
          </div>
          <p className="max-w-3xl whitespace-pre-wrap font-headline text-lg italic leading-relaxed text-on-surface sm:text-xl">
            {meeting.summary.summary_markdown}
          </p>
        </section>
      ) : (
        <section className="mb-10 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5 sm:mb-16 sm:p-8">
          <p className="text-on-surface-variant">
            {meeting.status === "completed" || meeting.status === "in_progress"
              ? "Your meeting summary is being prepared. Check back in a minute — it will appear here when ready."
              : "No summary has been added for this meeting yet. Notes from your session will appear here after the meeting ends."}
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
    </PageShell>
  );
}
