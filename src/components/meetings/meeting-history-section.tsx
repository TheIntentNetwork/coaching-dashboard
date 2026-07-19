"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, MapPin, Video } from "lucide-react";
import { AdvocateBookingPanel } from "@/components/advocate/advocate-booking-panel";
import { usePortalSetup } from "@/lib/portal/client/use-portal-setup";
import { formatMeetingDateLabel, getMeetingType } from "@/lib/portal/meeting-types";
import type { PortalAdvocate, PortalMeetingListItem } from "@/lib/portal/types";

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
  const { setup } = usePortalSetup();
  const [meetings, setMeetings] = useState<PortalMeetingListItem[]>([]);
  const [advocate, setAdvocate] = useState<PortalAdvocate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [meetingsRes, advocateRes] = await Promise.all([
          fetch("/api/portal/meetings"),
          fetch("/api/portal/advocate"),
        ]);
        const meetingsJson = await meetingsRes.json();
        const advocateJson = await advocateRes.json();
        if (cancelled) return;
        if (!meetingsRes.ok) setError(meetingsJson.error || "Failed to load meetings");
        else setMeetings(meetingsJson.meetings || []);
        if (advocateRes.ok) setAdvocate(advocateJson.advocate ?? null);
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

  const mt = getMeetingType(setup?.meeting_type);
  const setupNotice =
    setup?.meeting_date &&
    (setup.status === "approved" ||
      setup.status === "submitted" ||
      setup.status === "under_review")
      ? {
          title: mt?.label || "Upcoming schedule",
          when: `${formatMeetingDateLabel(setup.meeting_date)}${
            setup.meeting_time ? ` · ${setup.meeting_time}` : ""
          }`,
        }
      : null;

  return (
    <div className="page-pad pb-20 sm:pb-24">
      <header className="mx-auto mb-8 flex max-w-5xl flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h1 className="page-title mb-3 sm:mb-4">Meetings</h1>
          <p className="font-body text-sm leading-relaxed text-on-surface-variant/80 sm:text-base">
            Review past meetings and summaries, and schedule another session with your advocate
            when you have credits remaining.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowBooking((v) => !v)}
          className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-soft"
        >
          {showBooking ? "Hide scheduler" : "Schedule meeting"}
        </button>
      </header>

      <div className="mx-auto max-w-5xl space-y-8">
        {showBooking ? (
          <AdvocateBookingPanel
            advocateName={advocate?.name ?? null}
            hasAdvocate={Boolean(advocate)}
          />
        ) : null}

        {setupNotice ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Scheduled from Set Schedule
            </p>
            <p className="mt-1 font-headline text-xl text-on-surface">{setupNotice.title}</p>
            <p className="text-sm text-on-surface-variant">{setupNotice.when}</p>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-3 py-16 text-on-surface-variant">
            <Loader2 className="animate-spin" size={18} />
            Loading meetings…
          </div>
        ) : meetings.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-6 py-10">
            <p className="text-on-surface-variant">
              No completed or booked advocate meetings yet. Use Schedule meeting to book a session
              with your package credits.
            </p>
          </div>
        ) : (
          <>
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
