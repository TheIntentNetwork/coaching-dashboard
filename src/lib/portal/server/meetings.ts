import { createAdminClient } from "@/lib/supabase/admin";
import {
  ensureAppointmentJoinCredentials,
  resolveMeetingLink,
} from "@/lib/portal/meeting-link";

const APPOINTMENT_COLUMNS = `
  id, advisor_id, start_time, end_time, duration_minutes, appointment_type, status,
  meeting_link, meeting_code, meeting_token, purpose, cancellation_reason, completed_at, created_at,
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
  meeting_token: string | null;
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
    meetingLink: resolveMeetingLink({
      appointmentId: row.id,
      meetingLink: row.meeting_link,
      meetingToken: row.meeting_token,
    }),
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

  const rows = (data ?? []) as unknown as RawAppointment[];
  const sanitized = await Promise.all(
    rows.map(async (row) => {
      if (
        (row.status === "scheduled" || row.status === "in_progress") &&
        !row.meeting_token
      ) {
        const link = await ensureAppointmentJoinCredentials(row.id);
        return {
          ...sanitizeAppointment(row),
          meetingLink: link,
        };
      }
      return sanitizeAppointment(row);
    }),
  );

  return sanitized;
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
  if (!data) return null;

  const row = data as unknown as RawAppointment;
  if (
    (row.status === "scheduled" || row.status === "in_progress") &&
    (!row.meeting_token || !row.meeting_link)
  ) {
    const link = await ensureAppointmentJoinCredentials(row.id);
    return { ...sanitizeAppointment(row), meetingLink: link };
  }

  return sanitizeAppointment(row);
}

export type UserMeetingSummary = {
  id: string;
  summary_markdown: string | null;
  questions_json: unknown;
  notes_json: unknown;
  checklist_json: unknown;
  updated_at: string;
};

/**
 * Family/parent summary for an appointment (role=user).
 * Callers must already have verified the appointment belongs to this user.
 * Looks up by appointment + role so a generated report still surfaces even if
 * user_id on the row was backfilled later.
 */
export async function fetchUserMeetingSummary(
  appointmentId: string,
  _userId?: string,
): Promise<UserMeetingSummary | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("portal_meeting_summaries")
    .select("id, summary_markdown, questions_json, notes_json, checklist_json, updated_at")
    .eq("appointment_id", appointmentId)
    .eq("role", "user")
    .maybeSingle();

  return data ?? null;
}

export function meetingHasUserSummary(
  summary: UserMeetingSummary | null | undefined,
): boolean {
  return Boolean(summary?.summary_markdown?.trim());
}
