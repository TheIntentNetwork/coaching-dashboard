export type MeetingTypeId =
  | "annual_iep_review"
  | "initial_eligibility"
  | "triennial_reevaluation"
  | "amended_iep"
  | "plan_504";

export type MeetingTypeDef = {
  id: MeetingTypeId;
  label: string;
  shortTitle: string;
  description: string;
  prepFocus: string;
};

export const MEETING_TYPES: MeetingTypeDef[] = [
  {
    id: "annual_iep_review",
    label: "Annual IEP Review",
    shortTitle: "Annual Review",
    description:
      "Review progress on current goals, update present levels, and set services and accommodations for the next year.",
    prepFocus:
      "Bring questions about goal progress, service minutes, and accommodations that are or are not working.",
  },
  {
    id: "initial_eligibility",
    label: "Initial Eligibility",
    shortTitle: "Eligibility Meeting",
    description:
      "Determine whether your child qualifies for special education and what supports may be needed.",
    prepFocus:
      "Prepare questions about evaluation results, eligibility criteria, and next steps if services are recommended.",
  },
  {
    id: "triennial_reevaluation",
    label: "Triennial Re-evaluation",
    shortTitle: "Triennial Re-evaluation",
    description:
      "Reassess eligibility and needs with updated evaluations, typically every three years.",
    prepFocus:
      "Note concerns about changing needs, new evaluations, and whether current supports still fit.",
  },
  {
    id: "amended_iep",
    label: "Amended IEP Meeting",
    shortTitle: "IEP Amendment",
    description:
      "Adjust an existing IEP when goals, services, or placements need a mid-cycle change.",
    prepFocus:
      "List the specific changes you want and why current services are not meeting needs.",
  },
  {
    id: "plan_504",
    label: "504 Plan Meeting",
    shortTitle: "504 Plan Meeting",
    description:
      "Discuss Section 504 accommodations to ensure equal access in the general education setting.",
    prepFocus:
      "Focus on classroom access barriers and concrete accommodations that would help day to day.",
  },
];

export function getMeetingType(id: string | null | undefined): MeetingTypeDef | null {
  if (!id) return null;
  return MEETING_TYPES.find((t) => t.id === id || t.label === id) ?? null;
}

export function formatDueLabel(meetingDate: string | null | undefined): string | null {
  if (!meetingDate) return null;
  const target = new Date(`${meetingDate}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due in 1 day";
  if (diffDays > 1) return `Due in ${diffDays} days`;
  if (diffDays === -1) return "1 day overdue";
  return `${Math.abs(diffDays)} days overdue`;
}

export function formatMeetingDateLabel(meetingDate: string | null | undefined): string {
  if (!meetingDate) return "Still not set";
  const d = new Date(`${meetingDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return meetingDate;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
