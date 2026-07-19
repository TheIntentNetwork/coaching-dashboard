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

export function buildScheduleJourneySteps(params: {
  meetingLabel?: string | null;
  meetingDateLabel?: string | null;
  hasDraft: boolean;
  scheduled: boolean;
}): JourneyStep[] {
  const meetingTitle = params.meetingLabel
    ? `${params.meetingLabel} scheduled`
    : "Meeting scheduled";
  return [
    {
      id: "scheduled",
      title: meetingTitle,
      body: params.meetingDateLabel || null,
      state: params.scheduled ? "done" : "upcoming",
    },
    {
      id: "draft",
      title: "IEP draft uploaded",
      state: params.hasDraft ? "done" : params.scheduled ? "active" : "upcoming",
    },
    {
      id: "waiting",
      title: "Waiting for the meeting",
      body: params.scheduled
        ? "Your schedule is set. Prep when you’re ready."
        : "Complete Set Schedule to lock in your meeting.",
      state: params.scheduled && params.hasDraft ? "active" : "upcoming",
    },
  ];
}
