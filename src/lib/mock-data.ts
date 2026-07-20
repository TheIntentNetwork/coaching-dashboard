import { CHILD_NAME } from "@/lib/nav";

export const mockChild = {
  nickname: CHILD_NAME,
  grade: "3rd Grade",
  school: "Lincoln Elementary",
  focusAreas: "Reading intervention, speech goals",
};

export const mockMeeting = {
  id: "annual-2026",
  title: "Annual Review",
  dateLabel: "May 23",
  fullDate: "May 23, 2026",
  time: "10:30 AM",
  school: "Lincoln Elementary",
  focus:
    "Focus: Reviewing 3rd-grade performance metrics and defining 4th-grade speech goals.",
};

export const mockPriority = {
  title: `Prep for ${CHILD_NAME}'s Annual Review`,
  description:
    "The annual assessment draft has been received. Review the proposed accommodations and add your notes before the meeting.",
  dueLabel: "Due in 3 days",
  href: "/case-file/prep",
};

export const mockActivity = [
  {
    title: "IEP Draft Uploaded",
    detail: "Lincoln Elementary sent the updated draft.",
    when: "2h ago",
  },
  {
    title: "Meeting Brief Generated",
    detail: "Copilot analyzed 3 months of progress notes.",
    when: "Yesterday",
  },
];

export const mockTimeline = [
  {
    date: "October 12, 2023",
    title: "IEP Uploaded",
    body: `The annual Individualized Education Program document for the 2023-2024 academic cycle has been digitized. Learning goals, accommodations, and related service minutes are ready for review.`,
    icon: "upload",
    upcoming: false,
  },
  {
    date: "October 15, 2023",
    title: "Meeting Brief Created",
    body: `SustainBL generated a brief summarizing key tension points from ${CHILD_NAME}'s last quarterly progress report, including a gap in reading comprehension metrics.`,
    icon: "file",
    upcoming: false,
    insight: "Focus on Section 4.2: Literacy Accommodations",
  },
  {
    date: "Yesterday",
    title: "Prep Notes Saved",
    body: "Personal advocate notes regarding occupational therapy progress emphasize the need for more consistent sensory breaks during morning sessions.",
    icon: "edit",
    upcoming: false,
  },
  {
    date: "October 30, 2023 (Scheduled)",
    title: "Upcoming Annual IEP Meeting",
    body: "Annual review with the district committee. Key focus: transition plan and assistive technology requirements.",
    icon: "calendar",
    upcoming: true,
  },
];

export const mockDocuments = [
  {
    name: "Draft IEP 2026",
    detail: "Ready for parental input and goal adjustments.",
    category: "Legal",
    status: "Pending Review",
    statusTone: "tertiary" as const,
    added: "Sep 12, 2025",
  },
  {
    name: "Psychological Evaluation 2025",
    detail: "Comprehensive cognitive and behavioral assessment.",
    category: "Evaluation",
    status: "Signed",
    statusTone: "secondary" as const,
    added: "Aug 28, 2025",
  },
  {
    name: "Email: Speech Services Update",
    detail: "Correspondence regarding service hour adjustments.",
    category: "Correspondence",
    status: "Archived",
    statusTone: "secondary" as const,
    added: "Aug 15, 2025",
  },
  {
    name: "Report Card: Q1 2025",
    detail: "Performance summary for first quarter academic goals.",
    category: "Progress",
    status: "Reviewed",
    statusTone: "secondary" as const,
    added: "Jul 30, 2025",
  },
];

export const mockPrepQuestions = [
  {
    n: "01",
    title: "Ask about reading intervention hours",
    note: "Reference page 12 of the previous assessment.",
  },
  {
    n: "02",
    title: "What specific math manipulatives are used daily?",
    note: "Goal 2.B implementation check.",
  },
  {
    n: "03",
    title: "Clarify the transitional support during lunch periods.",
    note: "Social interaction concerns.",
  },
];

export const mockFlags = [
  {
    label: "Critical Concern",
    title: "Flag: Sensory breaks not being implemented consistently.",
    detail: `${CHILD_NAME} reported missing three breaks this week due to classroom overlap.`,
  },
  {
    label: "Documentation Gap",
    title: "Missing quarterly progress report for Speech Therapy.",
    detail: "Last received documentation was from October.",
  },
];

export const mockParentNotes = [
  `${CHILD_NAME} seems more frustrated on Tuesdays. Need to investigate if the morning schedule change is causing fatigue before the OT session.`,
  `Remind the team that ${CHILD_NAME} responds very well to visual timers during clean-up transitions.`,
];

export const mockMeetings = [
  {
    id: "annual-2026",
    date: "Oct 14, 2026",
    title: "Annual IEP Review",
    location: "Lincoln Elementary",
    status: "Summary Ready",
    statusTone: "primary" as const,
    summary:
      "Reviewed reading progress and locked in speech goals for the next school year with the IEP team.",
  },
  {
    id: "eval-2026",
    date: "Sep 12, 2026",
    title: "Initial Evaluation Results",
    location: "District Office, Rm 402",
    status: "Archived",
    statusTone: "secondary" as const,
    summary:
      "Walked through evaluation findings and flagged four areas needing clearer accommodations in the draft.",
  },
  {
    id: "transition-2026",
    date: "May 05, 2026",
    title: "Transition Planning Session",
    location: "Virtual Meeting",
    status: "Archived",
    statusTone: "secondary" as const,
    summary:
      "Mapped summer supports and aligned classroom strategies before the fall transition.",
  },
  {
    id: "bip-2026",
    date: "Jan 20, 2026",
    title: "Behavior Intervention Plan (BIP)",
    location: "Lincoln Elementary",
    status: "Archived",
    statusTone: "secondary" as const,
    summary:
      "Agreed on sensory-break timing and how the school will track BIP fidelity week to week.",
  },
];


export const mockReports = [
  {
    id: "q1-2023",
    date: "Oct 24, 2023",
    name: "Q1 Progress Summary",
    meeting: "General Review",
    status: "Ready",
  },
  {
    id: "annual-draft",
    date: "Sep 12, 2023",
    name: "Annual IEP Draft Analysis",
    meeting: "Annual Review 2023",
    status: "Ready",
  },
  {
    id: "prep-sheet",
    date: "Aug 05, 2023",
    name: "Advocacy Prep Sheet",
    meeting: "Initial Evaluation",
    status: "Ready",
  },
  {
    id: "eoy",
    date: "Jun 18, 2023",
    name: "End of Year Narrative",
    meeting: "Transition Meeting",
    status: "Archived",
  },
];
