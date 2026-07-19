"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, MapPin, Video } from "lucide-react";
import type { PortalMeetingListItem } from "@/lib/portal/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusLabel(meeting: PortalMeetingListItem) {
  if (meeting.hasSummary) return "Summary Ready";
  switch (meeting.status) {
    case "scheduled":
      return "Upcoming";
    case "cancelled":
      return "Cancelled";
    case "no_show":
      return "No-show";
    case "completed":
      return "Completed";
    default:
      return meeting.status;
  }
}

function statusTone(meeting: PortalMeetingListItem): "primary" | "secondary" {
  return meeting.hasSummary || meeting.status === "scheduled" ? "primary" : "secondary";
}

function StatusBadge({ meeting }: { meeting: PortalMeetingListItem }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        statusTone(meeting) === "primary"
          ? "bg-primary-container/20 text-on-primary-fixed-variant"
          : "bg-secondary-container/50 text-secondary"
      }`}
    >
      {statusTone(meeting) === "primary" ? (
        <span className="h-1 w-1 animate-pulse rounded-full bg-primary" />
      ) : null}
      {statusLabel(meeting)}
    </span>
  );
}

export function MeetingHistorySection() {
  const [meetings, setMeetings] = useState<PortalMeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/portal/meetings");
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) setError(json.error || "Failed to load meetings");
        else setMeetings(json.meetings || []);
      } catch {
        if (!cancelled) setError("Failed to load meetings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-pad pb-20 sm:pb-24">
      <header className="mx-auto max-w-5xl pb-8 sm:pb-12">
        <h1 className="page-title mb-3 sm:mb-4">Meetings</h1>
        <p className="max-w-xl font-body text-sm leading-relaxed text-on-surface-variant/80 sm:text-base">
          A chronological record of your advocacy journey. Review past decisions, access generated
          summaries, and track commitments made during educational meetings.
        </p>
      </header>

      <div className="mx-auto max-w-5xl">
        {error ? (
          <p className="mb-8 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-3 py-16 text-on-surface-variant">
            <Loader2 className="animate-spin" size={18} />
            Loading meetings…
          </div>
        ) : meetings.length === 0 ? (
          <p className="py-16 text-on-surface-variant">
            No meetings yet. Once your advocate schedules a meeting, it will show up here.
          </p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {meetings.map((m) => (
                <Link
                  key={m.id}
                  href={`/meetings/${m.id}`}
                  className="block rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft transition-colors hover:border-primary/40"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h2 className="font-headline text-lg text-on-surface">
                      {m.appointmentType || m.purpose || "Meeting"}
                    </h2>
                    <StatusBadge meeting={m} />
                  </div>
                  <p className="mb-2 text-sm text-on-surface-variant">{formatDate(m.startTime)}</p>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    {m.meetingLink ? (
                      <Video size={16} className="opacity-40" />
                    ) : (
                      <MapPin size={16} className="opacity-40" />
                    )}
                    {m.advisorName || "Your advocate"}
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="grid grid-cols-12 border-b border-outline-variant/30 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 lg:px-6">
                <div className="col-span-2">Date</div>
                <div className="col-span-5">Meeting Title</div>
                <div className="col-span-3">With</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {meetings.map((m) => (
                <Link
                  key={m.id}
                  href={`/meetings/${m.id}`}
                  className="group grid grid-cols-12 cursor-pointer items-center border-b border-outline-variant/30 px-4 py-8 transition-all duration-300 hover:bg-surface-container-low lg:px-6 lg:py-10"
                >
                  <div className="col-span-2 font-body text-sm text-on-surface-variant">
                    {formatDate(m.startTime)}
                  </div>
                  <div className="col-span-5 min-w-0 pr-3">
                    <h2 className="truncate font-headline text-xl text-on-surface transition-colors group-hover:text-primary lg:text-2xl">
                      {m.appointmentType || m.purpose || "Meeting"}
                    </h2>
                  </div>
                  <div className="col-span-3 flex items-center gap-2 font-body text-sm text-on-surface-variant">
                    {m.meetingLink ? (
                      <Video size={16} className="shrink-0 opacity-40" />
                    ) : (
                      <MapPin size={16} className="shrink-0 opacity-40" />
                    )}
                    <span className="truncate">{m.advisorName || "Your advocate"}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <StatusBadge meeting={m} />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
