import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildGuestMeetingLink,
  ensureAppointmentJoinCredentials,
  generateMeetingToken,
} from "@/lib/portal/meeting-link";
import { getMeetingType } from "@/lib/portal/meeting-types";
import { getProfileDisplayName, getProfileEmail } from "@/lib/portal/server/profile";
import type { SupabaseServerClient } from "@/lib/portal/server/auth";

const DEFAULT_DURATION_MINUTES = 60;

function parseLocalDateTime(date: string, time: string): Date | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;
  const local = new Date(y, m - 1, d, hour, minute, 0, 0);
  if (Number.isNaN(local.getTime())) return null;
  return local;
}

/**
 * Creates (or reuses) an appointments row for the client's Set Schedule choice.
 * Does not consume session credits — package booking is separate.
 */
export async function ensureSetupAppointment(
  supabase: SupabaseServerClient,
  userId: string,
  setup: {
    appointment_id?: string | null;
    advisor_id?: string | null;
    meeting_date?: string | null;
    meeting_time?: string | null;
    meeting_type?: string | null;
  },
): Promise<string | null> {
  if (setup.appointment_id) {
    await ensureAppointmentJoinCredentials(setup.appointment_id);
    return setup.appointment_id;
  }
  if (!setup.advisor_id || !setup.meeting_date || !setup.meeting_time) return null;

  const start = parseLocalDateTime(setup.meeting_date, setup.meeting_time);
  if (!start) return null;

  const end = new Date(start.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000);
  const meetingType = getMeetingType(setup.meeting_type);
  const purpose = meetingType?.label || setup.meeting_type || "Scheduled meeting";
  const appointmentType = meetingType?.id || setup.meeting_type || "scheduled_meeting";

  const admin = createAdminClient();

  // Avoid duplicates if a prior attempt created the row but failed to link it.
  const { data: existing } = await admin
    .from("appointments")
    .select("id")
    .eq("veteran_user_id", userId)
    .eq("advisor_id", setup.advisor_id)
    .eq("start_time", start.toISOString())
    .maybeSingle();

  if (existing?.id) {
    await ensureAppointmentJoinCredentials(existing.id as string);
    await supabase
      .from("portal_setup")
      .update({ appointment_id: existing.id })
      .eq("user_id", userId);
    return existing.id as string;
  }

  const email = await getProfileEmail(supabase, userId);
  const displayName = (await getProfileDisplayName(supabase, userId)) || "Client";
  const meetingToken = generateMeetingToken();

  const { data, error } = await admin
    .from("appointments")
    .insert({
      advisor_id: setup.advisor_id,
      veteran_user_id: userId,
      veteran_email: email,
      veteran_name: displayName,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      duration_minutes: DEFAULT_DURATION_MINUTES,
      appointment_type: appointmentType,
      status: "scheduled",
      purpose,
      scheduled_by: userId,
      meeting_token: meetingToken,
      meeting_link: null,
      extra_data: { source: "brand_portal_setup" },
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[ensureSetupAppointment]", error?.message);
    return null;
  }

  const meetingLink = buildGuestMeetingLink(data.id as string, meetingToken);
  await admin
    .from("appointments")
    .update({ meeting_link: meetingLink })
    .eq("id", data.id);

  await supabase
    .from("portal_setup")
    .update({ appointment_id: data.id })
    .eq("user_id", userId);

  return data.id as string;
}
