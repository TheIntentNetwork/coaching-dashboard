"use client";

import { Loader2 } from "lucide-react";
import { CoverImage } from "@/components/ui/cover-image";
import { IMAGES } from "@/lib/images";
import { useDashboardData } from "@/lib/portal/client/use-dashboard-data";

export function UpcomingMeeting() {
  const { data, loading, error } = useDashboardData();
  const upcoming = data?.upcomingMeeting;
  const meeting = upcoming && upcoming !== "still_not_set" ? upcoming : null;

  return (
    <section className="py-2">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
        Upcoming Meeting
      </h2>
      <div className="space-y-4">
        <div className="relative mb-2 aspect-[16/10] overflow-hidden rounded-lg bg-surface-container shadow-soft">
          <CoverImage src={IMAGES.dashboardMeeting} alt="Calm backdrop for upcoming IEP meeting" />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Loader2 className="animate-spin" size={16} />
            Loading…
          </div>
        ) : error ? (
          <p className="text-sm text-tertiary">{error}</p>
        ) : meeting ? (
          <>
            <div className="space-y-1.5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <h3 className="font-headline text-xl text-on-surface sm:text-2xl">
                  {meeting.meetingType || "Meeting"}
                </h3>
                <span className="shrink-0 text-sm font-bold text-primary">{meeting.dateLabel}</span>
              </div>
            </div>
            {meeting.focus ? (
              <p className="text-sm italic leading-relaxed text-on-surface-variant">{meeting.focus}</p>
            ) : null}
          </>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-headline text-2xl text-on-surface">No meeting yet</h3>
              <span className="shrink-0 text-sm font-bold text-on-surface-variant">Still not set</span>
            </div>
            <p className="text-sm text-on-surface-variant">
              Set your next meeting date in Set Schedule to see it here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
