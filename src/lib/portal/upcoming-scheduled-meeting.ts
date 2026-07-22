import {
  formatMeetingTitle,
  getMeetingType,
} from "@/lib/portal/meeting-types";
import { resolveMeetingTarget } from "@/lib/portal/meeting-datetime";
import type {
  PortalDashboardResponse,
  PortalMeetingListItem,
  PortalSetup,
} from "@/lib/portal/types";

export type UpcomingScheduledMeetingInfo = {
  title: string;
  whenLabel: string;
  startsAt: Date;
};

function formatWhenLabel(startsAt: Date, timeLabel?: string | null) {
  const datePart = startsAt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  if (timeLabel?.trim()) return `${datePart} · ${timeLabel.trim()}`;
  return startsAt.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isFuture(startsAt: Date, now = Date.now()) {
  return startsAt.getTime() > now;
}

function isDuplicate(
  candidates: UpcomingScheduledMeetingInfo[],
  startsAt: Date,
) {
  return candidates.some(
    (item) => Math.abs(item.startsAt.getTime() - startsAt.getTime()) < 60 * 60 * 1000,
  );
}

export function findUpcomingScheduledMeeting(params: {
  setup: PortalSetup | null;
  dashboard: PortalDashboardResponse | null;
  meetings: PortalMeetingListItem[];
}): UpcomingScheduledMeetingInfo | null {
  const now = Date.now();
  const candidates: UpcomingScheduledMeetingInfo[] = [];

  for (const meeting of params.meetings) {
    if (meeting.status !== "scheduled") continue;
    const startsAt = new Date(meeting.startTime);
    if (!isFuture(startsAt, now)) continue;
    candidates.push({
      title: formatMeetingTitle(meeting.appointmentType, meeting.purpose),
      whenLabel: formatWhenLabel(startsAt),
      startsAt,
    });
  }

  if (params.setup?.meeting_date) {
    const startsAt = resolveMeetingTarget(
      null,
      params.setup.meeting_date,
      params.setup.meeting_time,
    );
    if (startsAt && isFuture(startsAt, now) && !isDuplicate(candidates, startsAt)) {
      const meetingType = getMeetingType(params.setup.meeting_type);
      candidates.push({
        title: meetingType?.label || "Meeting",
        whenLabel: formatWhenLabel(startsAt, params.setup.meeting_time),
        startsAt,
      });
    }
  }

  const upcoming = params.dashboard?.upcomingMeeting;
  if (upcoming && upcoming !== "still_not_set") {
    const startsAt = resolveMeetingTarget(
      upcoming.startsAt,
      upcoming.meetingDate,
      params.setup?.meeting_time,
    );
    if (startsAt && isFuture(startsAt, now) && !isDuplicate(candidates, startsAt)) {
      const whenLabel =
        upcoming.dateLabel && upcoming.dateLabel !== "Scheduled"
          ? `${upcoming.dateLabel}${params.setup?.meeting_time ? ` · ${params.setup.meeting_time}` : ""}`
          : formatWhenLabel(startsAt, params.setup?.meeting_time);
      candidates.push({
        title: upcoming.meetingType || "Meeting",
        whenLabel,
        startsAt,
      });
    }
  }

  candidates.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return candidates[0] ?? null;
}
