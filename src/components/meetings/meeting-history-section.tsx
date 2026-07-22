"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, MapPin, Video } from "lucide-react";
import { AdvocateBookingPanel } from "@/components/advocate/advocate-booking-panel";
import { ScheduledMeetingNotice } from "@/components/booking/scheduled-meeting-notice";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { MeetingJoinActions } from "@/components/meetings/meeting-join-actions";
import { useUpcomingScheduledMeeting } from "@/lib/portal/client/use-upcoming-scheduled-meeting";
import { usePortalSetup } from "@/lib/portal/client/use-portal-setup";
import {
  formatMeetingDateLabel,
  formatMeetingTitle,
  getMeetingType,
} from "@/lib/portal/meeting-types";
import type { PortalMeetingListItem } from "@/lib/portal/types";
import { useAdvocateQuery } from "@/lib/portal/query/hooks/use-advocate";
import { useMeetingsQuery } from "@/lib/portal/query/hooks/use-meetings";

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
  const meetingsQuery = useMeetingsQuery();
  const advocateQuery = useAdvocateQuery();
  const upcomingMeeting = useUpcomingScheduledMeeting();
  const [showBooking, setShowBooking] = useState(false);

  const meetings = meetingsQuery.data?.meetings || [];
  const advocate = advocateQuery.data?.advocate ?? null;
  const loading =
    (meetingsQuery.isPending && !meetingsQuery.data) ||
    (advocateQuery.isPending && !advocateQuery.data);
  const error = meetingsQuery.error?.message || null;

  const mt = getMeetingType(setup?.meeting_type);
  const setupNotice =
    !upcomingMeeting &&
    setup?.meeting_date &&
    (setup.status === "approved" ||
      setup.status === "submitted" ||
      setup.status === "under_review") &&
    !meetings.some((m) => m.id === setup.appointment_id)
      ? {
          title: mt?.label || "Upcoming schedule",
          when: `${formatMeetingDateLabel(setup.meeting_date)}${
            setup.meeting_time ? ` · ${setup.meeting_time}` : ""
          }`,
        }
      : null;

  return (
    <PageShell className="pb-20 sm:pb-24">
      <PageHeader
        title="Meetings"
        description="Review past meetings and summaries, and schedule another session with your advocate when you have credits remaining."
        actions={
          <button
            type="button"
            onClick={() => setShowBooking(true)}
            className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-soft"
          >
            Book a Meeting
          </button>
        }
      />

      <div className="space-y-8">
        {upcomingMeeting && !showBooking ? (
          <ScheduledMeetingNotice meeting={upcomingMeeting} />
        ) : null}

        {showBooking ? (
          <AdvocateBookingPanel
            layout="split"
            returnTo="/meetings"
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
              No completed or booked advocate meetings yet. Use Book a Meeting to book a session
              with your package credits.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {meetings.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft"
                >
                  <Link href={`/meetings/${m.id}`} className="block transition-colors hover:border-primary/40">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h2 className="font-headline text-lg text-on-surface">
                        {formatMeetingTitle(m.appointmentType, m.purpose)}
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
                  {m.status === "scheduled" ? (
                    <div className="mt-3">
                      <MeetingJoinActions
                        copilotJoinUrl={m.meetingLink}
                        thirdPartyJoinUrl={m.thirdPartyJoinUrl}
                        thirdPartyLabel={m.thirdPartyLabel}
                        meetingDetailHref={`/meetings/${m.id}`}
                        layout="row"
                        size="sm"
                      />
                    </div>
                  ) : null}
                </div>
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
                <div
                  key={m.id}
                  className="grid grid-cols-12 items-center border-b border-outline-variant/30 px-4 py-8 transition-all duration-300 hover:bg-surface-container-low lg:px-6 lg:py-10"
                >
                  <Link
                    href={`/meetings/${m.id}`}
                    className="col-span-10 grid grid-cols-10 items-center"
                  >
                    <div className="col-span-2 font-body text-sm text-on-surface-variant">
                      {formatDate(m.startTime)}
                    </div>
                    <div className="col-span-5 min-w-0 pr-3">
                      <h2 className="truncate font-headline text-xl text-on-surface transition-colors hover:text-primary lg:text-2xl">
                        {formatMeetingTitle(m.appointmentType, m.purpose)}
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
                  </Link>
                  <div className="col-span-2 flex flex-col items-end gap-2 text-right">
                    <StatusBadge meeting={m} />
                    {m.status === "scheduled" ? (
                      <MeetingJoinActions
                        copilotJoinUrl={m.meetingLink}
                        thirdPartyJoinUrl={m.thirdPartyJoinUrl}
                        thirdPartyLabel={m.thirdPartyLabel}
                        meetingDetailHref={`/meetings/${m.id}`}
                        layout="row"
                        size="sm"
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
