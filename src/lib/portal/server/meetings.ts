import { createAdminClient } from "@/lib/supabase/admin";

const APPOINTMENT_COLUMNS = `
  id, advisor_id, start_time, end_time, duration_minutes, appointment_type, status,
  meeting_link, meeting_code, purpose, cancellation_reason, completed_at, created_at,
  advisors ( id, first_name, last_name )
`;

type AdvisorRef = { id: string; first_name: string; last_name: string };

type RawAppointment = {
  id: string;
  advisor_id: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  appointment_type: string | null;
  status: string;
  meeting_link: string | null;
  meeting_code: string | null;
  purpose: string | null;
  cancellation_reason: string | null;
  completed_at: string | null;
  created_at: string;
  advisors: AdvisorRef | AdvisorRef[] | null;
};

export type SanitizedAppointment = {
  id: string;
  advisorId: string | null;
  advisorName: string | null;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  appointmentType: string | null;
  status: string;
  meetingLink: string | null;
  meetingCode: string | null;
  purpose: string | null;
  cancellationReason: string | null;
  completedAt: string | null;
  createdAt: string;
};

function sanitizeAppointment(row: RawAppointment): SanitizedAppointment {
  const advisor = Array.isArray(row.advisors) ? row.advisors[0] : row.advisors;

  return {
    id: row.id,
    advisorId: row.advisor_id,
    advisorName: advisor ? `${advisor.first_name} ${advisor.last_name}`.trim() : null,
    startTime: row.start_time,
    endTime: row.end_time,
    durationMinutes: row.duration_minutes,
    appointmentType: row.appointment_type,
    status: row.status,
    meetingLink: row.meeting_link,
    meetingCode: row.meeting_code,
    purpose: row.purpose,
    cancellationReason: row.cancellation_reason,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

/**
 * appointments RLS only allows matching on veteran_user_id, but the portal
 * also needs to match veterans invited by email before they had an account.
 * The service-role client is required to evaluate the OR-by-email case.
 */
export async function fetchAppointmentsForUser(
  userId: string,
  email: string | null,
): Promise<SanitizedAppointment[]> {
  const admin = createAdminClient();
  const base = admin.from("appointments").select(APPOINTMENT_COLUMNS);
  const scoped = email
    ? base.or(`veteran_user_id.eq.${userId},veteran_email.eq.${email}`)
    : base.eq("veteran_user_id", userId);

  const { data, error } = await scoped.order("start_time", { ascending: false });
  if (error) throw error;

  return ((data ?? []) as unknown as RawAppointment[]).map(sanitizeAppointment);
}

export async function fetchAppointmentForUser(
  appointmentId: string,
  userId: string,
  email: string | null,
): Promise<SanitizedAppointment | null> {
  const admin = createAdminClient();
  const base = admin.from("appointments").select(APPOINTMENT_COLUMNS).eq("id", appointmentId);
  const scoped = email
    ? base.or(`veteran_user_id.eq.${userId},veteran_email.eq.${email}`)
    : base.eq("veteran_user_id", userId);

  const { data, error } = await scoped.maybeSingle();
  if (error) throw error;

  return data ? sanitizeAppointment(data as unknown as RawAppointment) : null;
}

export type UserMeetingSummary = {
  id: string;
  summary_markdown: string | null;
  questions_json: unknown;
  notes_json: unknown;
  checklist_json: unknown;
  updated_at: string;
};

export async function fetchUserMeetingSummary(
  appointmentId: string,
  userId: string,
): Promise<UserMeetingSummary | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("portal_meeting_summaries")
    .select("id, summary_markdown, questions_json, notes_json, checklist_json, updated_at")
    .eq("appointment_id", appointmentId)
    .eq("user_id", userId)
    .eq("role", "user")
    .maybeSingle();

  return data ?? null;
}
