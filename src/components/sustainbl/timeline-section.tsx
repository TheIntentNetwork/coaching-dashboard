"use client";

import { usePortalSetup } from "@/lib/portal/client/use-portal-setup";
import { useAppSession } from "@/components/auth/session-provider";
import {
  JourneySteps,
  buildScheduleJourneySteps,
} from "@/components/portal/journey-steps";
import { formatMeetingDateLabel, getMeetingType } from "@/lib/portal/meeting-types";

export function TimelineSection() {
  const { displayName } = useAppSession();
  const { setup, loading } = usePortalSetup();

  const studentName = setup?.student_name || displayName;
  const mt = getMeetingType(setup?.meeting_type);
  const steps = buildScheduleJourneySteps({
    meetingLabel: mt?.label || setup?.meeting_type,
    meetingDateLabel: setup?.meeting_date
      ? `${formatMeetingDateLabel(setup.meeting_date)}${setup.meeting_time ? ` · ${setup.meeting_time}` : ""}`
      : null,
    hasDraft: Boolean(setup?.draft_document_id),
    scheduled: Boolean(
      setup?.meeting_date &&
        setup.status !== "draft" &&
        setup.status !== "needs_changes",
    ),
  });

  return (
    <div className="page-pad mx-auto max-w-5xl pb-20 sm:pb-32">
      <section className="mb-8 sm:mb-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
              {studentName}&apos;s SustainBL
            </span>
            <h1 className="page-title">Educational Timeline</h1>
          </div>
        </div>
      </section>

      {loading ? (
        <p className="text-on-surface-variant">Loading timeline…</p>
      ) : (
        <JourneySteps steps={steps} />
      )}
    </div>
  );
}
