"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, FileText, Loader2 } from "lucide-react";
import { useDashboardData } from "@/lib/portal/client/use-dashboard-data";
import { usePortalSetup } from "@/lib/portal/client/use-portal-setup";
import {
  JourneySteps,
  buildScheduleJourneySteps,
} from "@/components/portal/journey-steps";
import { formatMeetingDateLabel } from "@/lib/portal/meeting-types";
import { getMeetingType } from "@/lib/portal/meeting-types";

export function PriorityAction() {
  const { data, loading, error } = useDashboardData();
  const { setup } = usePortalSetup();
  const priority = data?.priority ?? null;
  const [draftName, setDraftName] = useState<string | null>(null);

  useEffect(() => {
    const id = setup?.draft_document_id;
    if (!id) {
      setDraftName(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/documents/${id}`);
      const json = await res.json();
      if (!cancelled && res.ok) setDraftName(json.name || "IEP draft");
    })();
    return () => {
      cancelled = true;
    };
  }, [setup?.draft_document_id]);

  const mt = getMeetingType(setup?.meeting_type);
  const journey = buildScheduleJourneySteps({
    meetingLabel: mt?.label || setup?.meeting_type,
    meetingDateLabel: setup?.meeting_date
      ? `${formatMeetingDateLabel(setup.meeting_date)}${setup.meeting_time ? ` · ${setup.meeting_time}` : ""}`
      : null,
    hasDraft: Boolean(setup?.draft_document_id),
    scheduled: Boolean(setup?.meeting_date && setup.status !== "draft" && setup.status !== "needs_changes"),
  });

  return (
    <section className="space-y-10 py-2">
      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
          Priority Action
        </h2>

        {loading ? (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Loader2 className="animate-spin" size={16} />
            Loading…
          </div>
        ) : error ? (
          <p className="text-sm text-tertiary">{error}</p>
        ) : priority ? (
          <div className="flex flex-col items-start gap-3 sm:gap-4 md:flex-row md:justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 font-headline text-xl text-on-surface sm:text-2xl md:text-3xl">
                {priority.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-on-surface-variant sm:text-base">
                {priority.description}
              </p>
              <Link
                href={priority.href}
                className="inline-flex items-center gap-2 border-b border-primary/30 pb-1 font-bold text-primary transition-all hover:border-primary"
              >
                Start Preparation
                <ArrowRight size={16} />
              </Link>
            </div>
            {priority.dueLabel ? (
              <div className="shrink-0 md:text-right">
                <span className="text-xs font-bold uppercase tracking-widest text-error">
                  {priority.dueLabel}
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
            <p className="mb-3 text-on-surface-variant">
              No meeting scheduled yet. Complete Set Schedule to get a personalized prep plan.
            </p>
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 font-bold text-primary transition-all hover:opacity-80"
            >
              Go to Set Schedule
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {draftName ? (
        <div className="flex items-start gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low/80 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Submitted draft
            </p>
            <p className="truncate font-headline text-lg text-on-surface">{draftName}</p>
            <Link
              href="/sustainbl/documents"
              className="mt-1 inline-block text-sm font-semibold text-primary hover:opacity-80"
            >
              View in Documents
            </Link>
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
          Your Journey
        </h2>
        <JourneySteps steps={journey} compact />
      </div>
    </section>
  );
}
