"use client";

import { CalendarClock } from "lucide-react";
import type { UpcomingScheduledMeetingInfo } from "@/lib/portal/upcoming-scheduled-meeting";

type ScheduledMeetingNoticeProps = {
  meeting: UpcomingScheduledMeetingInfo;
  /** When true, show the proceed checkbox for booking another session. */
  requireProceedAck?: boolean;
  proceedAcknowledged?: boolean;
  onProceedAckChange?: (value: boolean) => void;
};

export function ScheduledMeetingNotice({
  meeting,
  requireProceedAck = false,
  proceedAcknowledged = false,
  onProceedAckChange,
}: ScheduledMeetingNoticeProps) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-4 sm:px-5">
      <div className="flex gap-3">
        <CalendarClock size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Meeting already scheduled
          </p>
          <p className="mt-1 font-headline text-lg text-on-surface">{meeting.title}</p>
          <p className="mt-1 text-sm text-on-surface-variant">{meeting.whenLabel}</p>
          {requireProceedAck ? (
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-on-surface">
              <input
                type="checkbox"
                checked={proceedAcknowledged}
                onChange={(e) => onProceedAckChange?.(e.target.checked)}
                className="mt-1"
              />
              <span>
                I still want to schedule another meeting and understand I may already have one
                coming up.
              </span>
            </label>
          ) : (
            <p className="mt-3 text-sm text-on-surface-variant">
              You can still book another session below if you need extra time with your advocate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
