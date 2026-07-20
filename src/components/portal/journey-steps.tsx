"use client";

import { Check, Circle } from "lucide-react";

export type JourneyStep = {
  id: string;
  title: string;
  body?: string | null;
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
            className={`relative flex gap-3 ${muted ? "opacity-45" : ""}`}
          >
            {index < steps.length - 1 ? (
              <span
                className={`absolute left-[11px] top-7 w-px ${compact ? "h-6" : "h-10"} ${
                  done ? "bg-primary/40" : "bg-outline-variant/50"
                }`}
                aria-hidden
              />
            ) : null}
            <span
              className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                done
                  ? "border-primary bg-primary text-on-primary"
                  : active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-outline-variant bg-surface-container text-on-surface-variant"
              }`}
            >
              {done ? <Check size={12} /> : <Circle size={8} fill="currentColor" />}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={`font-headline ${compact ? "text-base" : "text-lg"} ${
                  active ? "text-primary" : "text-on-surface"
                }`}
              >
                {step.title}
              </p>
              {step.body ? (
                <p className="mt-0.5 text-sm text-on-surface-variant">{step.body}</p>
              ) : null}
            </div>
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

  const push = (step: Omit<JourneyStep, "state"> & { done: boolean }) => {
    const state = stepState(step.done, previousDone);
    steps.push({
      id: step.id,
      title: step.title,
      body: step.body,
      state,
    });
    previousDone = step.done;
  };

  push({
    id: "documents",
    title: "Documents uploaded",
    body: "Evidence is in your Case file",
    done: params.hasDocuments,
  });
  push({
    id: "iep_draft",
    title: "IEP draft uploaded",
    body: "From Set Schedule",
    done: params.hasIepDraft,
  });
  push({
    id: "meeting",
    title: params.meetingLabel ? `${params.meetingLabel} scheduled` : "Meeting scheduled",
    body: params.meetingDateLabel || "Set your meeting date",
    done: params.meetingScheduled,
  });

  if (params.includeIepDomain) {
    push({
      id: "accommodations",
      title: "Accommodations listed",
      body: "Classroom supports with proof",
      done: params.hasAccommodations,
    });
    push({
      id: "compensatory",
      title: "Compensatory plan started",
      body: "Missed or owed services",
      done: params.hasCompensatory,
    });
    push({
      id: "journey",
      title: "Process journey updated",
      body: "Checklist of where you are",
      done: params.journeyTouched,
    });
  }

  push({
    id: "prep",
    title: "Meeting prep started",
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
