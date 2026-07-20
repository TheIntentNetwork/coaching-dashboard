export type JourneyMilestone = {
  id: string;
  label: string;
  guidance: string;
  done: boolean;
  completed_at: string | null;
  /** Parent/advocate-added steps (defaults are system milestones). */
  custom?: boolean;
};

export type JourneyFlags = {
  review_ard: boolean;
  mdard: boolean;
  staar_failure: boolean;
};

export const DEFAULT_JOURNEY_FLAGS: JourneyFlags = {
  review_ard: false,
  mdard: false,
  staar_failure: false,
};

export function defaultJourneyMilestones(): JourneyMilestone[] {
  return [
    {
      id: "referral",
      label: "Referral / Child Find",
      guidance: "School or parent referred the child for special education evaluation.",
      done: false,
      completed_at: null,
    },
    {
      id: "consent",
      label: "Parent consent to evaluate",
      guidance: "You signed consent for the initial evaluation.",
      done: false,
      completed_at: null,
    },
    {
      id: "evaluation_window",
      label: "Evaluation window",
      guidance: "District evaluation timeline is running (often 45–60 school days).",
      done: false,
      completed_at: null,
    },
    {
      id: "initial_ard",
      label: "Initial ARD / eligibility",
      guidance: "Eligibility meeting (initial ARD) to decide if services are needed.",
      done: false,
      completed_at: null,
    },
    {
      id: "iep_in_place",
      label: "IEP in place",
      guidance: "An IEP (or interim plan) is active for your child.",
      done: false,
      completed_at: null,
    },
    {
      id: "annual_review",
      label: "Annual review",
      guidance: "Yearly IEP / ARD review of goals, services, and placement.",
      done: false,
      completed_at: null,
    },
    {
      id: "triennial_reeval",
      label: "Triennial re-evaluation",
      guidance: "Full re-evaluation cycle (typically every three years).",
      done: false,
      completed_at: null,
    },
  ];
}
