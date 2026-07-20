export type MeetingTypeId =
  | "annual_iep_review"
  | "initial_eligibility"
  | "triennial_reevaluation"
  | "amended_iep"
  | "plan_504"
  | "review_ard"
  | "mdard"
  | "staar_failure_review"
  | "fba_meeting";

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
  {
    id: "review_ard",
    label: "Review ARD",
    shortTitle: "Review ARD",
    description:
      "Mid-cycle ARD / IEP team meeting to revise services, goals, or placement.",
    prepFocus:
      "List the changes you want and any new data (grades, behavior, related services).",
  },
  {
    id: "mdard",
    label: "MDARD (manifestation determination)",
    shortTitle: "MDARD",
    description:
      "Determine whether behavior leading to discipline was a manifestation of the disability.",
    prepFocus:
      "Gather behavior history, IEP/BIP details, and questions about placement and services.",
  },
  {
    id: "staar_failure_review",
    label: "STAAR-failure review",
    shortTitle: "STAAR Review",
    description:
      "Texas-focused review when state assessment results trigger accelerated instruction or plan changes.",
    prepFocus:
      "Bring score reports and questions about make-up instruction or IEP updates.",
  },
  {
    id: "fba_meeting",
    label: "FBA / BIP meeting",
    shortTitle: "FBA Meeting",
    description:
      "Discuss Functional Behavior Assessment findings and Behavior Intervention Plan supports.",
    prepFocus:
      "Note patterns at home/school and what interventions have or have not worked.",
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

/** Prefer purpose / meeting-type label over internal appointment_type slugs. */
export function formatMeetingTitle(
  appointmentType: string | null | undefined,
  purpose: string | null | undefined,
): string {
  const purposeText = purpose?.trim();
  if (purposeText) return purposeText;

  const typed = getMeetingType(appointmentType);
  if (typed) return typed.label;

  if (!appointmentType || appointmentType === "portal_booking" || appointmentType === "session") {
    return "Meeting";
  }

  return appointmentType
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
