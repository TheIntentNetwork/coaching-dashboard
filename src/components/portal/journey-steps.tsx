"use client";

import Link from "next/link";
import { Check, Circle } from "lucide-react";

export type JourneyStep = {
  id: string;
  title: string;
  body?: string | null;
  href: string;
  state: "done" | "active" | "upcoming";
};

type JourneyStepsProps = {
  steps: JourneyStep[];
  compact?: boolean;
};

export function JourneySteps({ steps, compact = false }: JourneyStepsProps) {
  return (
    <ol className={compact ? "space-y-4" : "space-y-6"}>
      {steps.map((step, index) => {
        const done = step.state === "done";
        const active = step.state === "active";
        const muted = step.state === "upcoming";
        return (
          <li
            key={step.id}
            className={`relative ${muted ? "opacity-45 hover:opacity-100" : ""}`}
          >
            {index < steps.length - 1 ? (
              <span
                className={`absolute left-[11px] top-7 w-px ${compact ? "h-6" : "h-10"} ${
                  done ? "bg-primary/40" : "bg-outline-variant/50"
                }`}
                aria-hidden
              />
            ) : null}
            <Link
              href={step.href}
              className="group relative z-10 flex gap-3 rounded-lg px-1 py-0.5 transition-colors hover:bg-surface-container-low/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label={`${step.title}${step.body ? ` — ${step.body}` : ""}`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  done
                    ? "border-primary bg-primary text-on-primary group-hover:bg-primary/90"
                    : active
                      ? "border-primary bg-primary/10 text-primary group-hover:bg-primary/15"
                      : "border-outline-variant bg-surface-container text-on-surface-variant group-hover:border-primary/30"
                }`}
              >
                {done ? <Check size={12} /> : <Circle size={8} fill="currentColor" />}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={`font-headline ${compact ? "text-base" : "text-lg"} transition-colors ${
                    active
                      ? "text-primary group-hover:text-primary"
                      : "text-on-surface group-hover:text-primary"
                  }`}
                >
                  {step.title}
                </p>
                {step.body ? (
                  <p className="mt-0.5 text-sm text-on-surface-variant">{step.body}</p>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function stepState(done: boolean, previousDone: boolean): JourneyStep["state"] {
  if (done) return "done";
  if (previousDone) return "active";
  return "upcoming";
}

const CASE_FILE_JOURNEY_HREFS = {
  documents: "/setup",
  iep_draft: "/setup/documentation",
  meeting: "/setup/milestone",
  accommodations: "/case-file/accommodations",
  compensatory: "/case-file/compensatory",
  journey: "/case-file/journey",
  prep: "/case-file/prep",
} as const;

/** Dashboard “Your Journey” — case-file progress (not the old timeline page). */
export function buildCaseFileJourneySteps(params: {
  hasDocuments: boolean;
  hasIepDraft: boolean;
  meetingScheduled: boolean;
  meetingLabel?: string | null;
  meetingDateLabel?: string | null;
  hasAccommodations: boolean;
  hasCompensatory: boolean;
  journeyTouched: boolean;
  hasPrep: boolean;
  includeIepDomain: boolean;
}): JourneyStep[] {
  const steps: JourneyStep[] = [];
  let previousDone = true;

  const push = (step: {
    id: keyof typeof CASE_FILE_JOURNEY_HREFS;
    titlePending: string;
    titleDone: string;
    body?: string | null;
    done: boolean;
    href?: string;
  }) => {
    const state = stepState(step.done, previousDone);
    steps.push({
      id: step.id,
      title: step.done ? step.titleDone : step.titlePending,
      body: step.body,
      href: step.href ?? CASE_FILE_JOURNEY_HREFS[step.id],
      state,
    });
    previousDone = step.done;
  };

  push({
    id: "documents",
    titlePending: "Documents upload",
    titleDone: "Documents uploaded",
    body: params.hasDocuments ? "Evidence is in your Case file" : "Start in Set Schedule",
    done: params.hasDocuments,
    href: params.hasDocuments ? "/case-file/documents" : "/setup",
  });
  push({
    id: "iep_draft",
    titlePending: "IEP draft upload",
    titleDone: "IEP draft uploaded",
    body: "From Set Schedule",
    done: params.hasIepDraft,
  });
  const meetingBase = params.meetingLabel || "Meeting";
  push({
    id: "meeting",
    titlePending: `${meetingBase} schedule`,
    titleDone: `${meetingBase} scheduled`,
    body: params.meetingDateLabel || "Set your meeting date",
    done: params.meetingScheduled,
  });

  if (params.includeIepDomain) {
    push({
      id: "accommodations",
      titlePending: "Accommodations list",
      titleDone: "Accommodations listed",
      body: "Classroom supports with proof",
      done: params.hasAccommodations,
    });
    push({
      id: "compensatory",
      titlePending: "Compensatory plan start",
      titleDone: "Compensatory plan started",
      body: "Missed or owed services",
      done: params.hasCompensatory,
    });
    push({
      id: "journey",
      titlePending: "Process journey update",
      titleDone: "Process journey updated",
      body: "Checklist of where you are",
      done: params.journeyTouched,
    });
  }

  push({
    id: "prep",
    titlePending: "Meeting prep start",
    titleDone: "Meeting prep started",
    body: "Questions, notes, or checklist",
    done: params.hasPrep,
  });

  return steps;
}

/** @deprecated Prefer buildCaseFileJourneySteps */
export function buildScheduleJourneySteps(params: {
  meetingLabel?: string | null;
  meetingDateLabel?: string | null;
  hasDraft: boolean;
  scheduled: boolean;
}): JourneyStep[] {
  return buildCaseFileJourneySteps({
    hasDocuments: params.hasDraft,
    hasIepDraft: params.hasDraft,
    meetingScheduled: params.scheduled,
    meetingLabel: params.meetingLabel,
    meetingDateLabel: params.meetingDateLabel,
    hasAccommodations: false,
    hasCompensatory: false,
    journeyTouched: false,
    hasPrep: false,
    includeIepDomain: false,
  });
}
