import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { getProfileEmail } from "@/lib/portal/server/profile";
import {
  fetchAppointmentsForUser,
  fetchUserMeetingSummary,
  meetingHasUserSummary,
} from "@/lib/portal/server/meetings";
import { ensureSetupAppointment } from "@/lib/portal/server/setup-appointment";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const email = await getProfileEmail(supabase, user.id);

  // Backfill: Set Schedule used to save only portal_setup — ensure an appointment exists.
  const { data: setup } = await supabase
    .from("portal_setup")
    .select("appointment_id, advisor_id, meeting_date, meeting_time, meeting_type, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    setup &&
    (setup.status === "approved" ||
      setup.status === "submitted" ||
      setup.status === "under_review")
  ) {
    await ensureSetupAppointment(supabase, user.id, setup);
  }

  let appointments;
  try {
    appointments = await fetchAppointmentsForUser(user.id, email);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load meetings";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const meetings = await Promise.all(
    appointments.map(async (appointment) => {
      const summary = await fetchUserMeetingSummary(appointment.id, user.id);
      return {
        ...appointment,
        hasSummary: meetingHasUserSummary(summary),
        summary: meetingHasUserSummary(summary) ? summary : null,
      };
    }),
  );

  return NextResponse.json({ meetings });
}
