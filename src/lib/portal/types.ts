export type PortalSetupStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "needs_changes";

export type PortalSetup = {
  id: string;
  user_id: string;
  student_name: string | null;
  meeting_date: string | null;
  meeting_time: string | null;
  meeting_type: string | null;
  draft_document_id: string | null;
  advisor_id: string | null;
  appointment_id: string | null;
  status: PortalSetupStatus;
  review_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PortalPrepItem = {
  id: string;
  user_id: string;
  item_type: "question" | "note" | "checklist";
  title: string | null;
  body: string;
  checked: boolean;
  sort_order: number;
  template_key: string | null;
  created_at: string;
  updated_at: string;
};

export type PortalTimelineEvent = {
  id: string;
  user_id: string;
  event_type: string;
  title: string;
  body: string | null;
  event_at: string;
  is_upcoming: boolean;
  meta: Record<string, unknown>;
  created_at: string;
};

export type PortalAdvocate = {
  advisorId: string;
  name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  title: string | null;
  program: string | null;
};

export type PortalMeetingTypeSummary = {
  id: string;
  label: string;
  shortTitle: string;
  description: string;
  prepFocus: string;
} | null;

export type PortalPriorityAction = {
  title: string;
  description: string;
  href: string;
  dueLabel: string | null;
} | null;

export type PortalUpcomingMeeting =
  | {
      meetingDate: string;
      /** ISO timestamp — preferred source for countdown when available. */
      startsAt?: string | null;
      dateLabel: string;
      meetingType: string | null;
      focus: string | null;
      studentName: string | null;
      appointmentId?: string | null;
      copilotJoinUrl?: string | null;
      thirdPartyJoinUrl?: string | null;
      thirdPartyLabel?: "zoom" | "meet" | "other" | null;
    }
  | "still_not_set";

export type PortalCaseProgress = {
  hasDocuments: boolean;
  hasIepDraft: boolean;
  meetingScheduled: boolean;
  hasAccommodations: boolean;
  hasCompensatory: boolean;
  journeyTouched: boolean;
  hasPrep: boolean;
  includeIepDomain: boolean;
  latestStatusLabel: string;
};

export type PortalIepProfile = {
  childName: string | null;
  childAge: string | null;
  gradeLevel: string | null;
  schoolDistrict: string | null;
  currentIepStatus: string | null;
  primaryDisability: string | null;
  secondaryDisabilities: string | null;
  currentChallenges: string | null;
  iepGoals: string | null;
  servicesReceived: string | null;
  accommodationsNeeded: string | null;
  behavioralConcerns: string | null;
  parentConcerns: string | null;
  additionalInfo: string | null;
};

export type PortalDashboardResponse = {
  setup: PortalSetup | null;
  meetingType: PortalMeetingTypeSummary;
  dueLabel: string | null;
  priority: PortalPriorityAction;
  upcomingMeeting: PortalUpcomingMeeting;
  parentName: string | null;
  studentName: string | null;
  iepProfile: PortalIepProfile | null;
  caseProgress?: PortalCaseProgress;
};

export type PortalMeetingSummary = {
  id: string;
  summary_markdown: string | null;
  questions_json: unknown;
  notes_json: unknown;
  checklist_json: unknown;
  updated_at: string;
};

export type PortalMeeting = {
  id: string;
  advisorId: string | null;
  advisorName: string | null;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  appointmentType: string | null;
  status: string;
  meetingLink: string | null;
  thirdPartyJoinUrl?: string | null;
  thirdPartyLabel?: "zoom" | "meet" | "other" | null;
  meetingCode: string | null;
  purpose: string | null;
  cancellationReason: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type PortalMeetingListItem = PortalMeeting & {
  hasSummary: boolean;
  summary: PortalMeetingSummary | null;
};

export type PortalMeetingDetail = PortalMeeting & {
  summary: PortalMeetingSummary | null;
};

export type SecureMessage = {
  id: string;
  thread_id: string;
  sender_user_id: string | null;
  sender_type: "veteran" | "advisor" | string;
  message_body: string;
  message_type: string | null;
  is_read: boolean;
  read_at: string | null;
  sent_at: string;
  created_at: string;
};

export type MessageThreadSummary = {
  id: string;
  subject: string | null;
  status: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  messageCount: number;
  unreadCount: number;
  advisorName: string | null;
  messages?: SecureMessage[];
};
