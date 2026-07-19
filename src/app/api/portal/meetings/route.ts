import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { getProfileEmail } from "@/lib/portal/server/profile";
import { fetchAppointmentsForUser, fetchUserMeetingSummary } from "@/lib/portal/server/meetings";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const email = await getProfileEmail(supabase, user.id);

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
      return { ...appointment, hasSummary: Boolean(summary), summary };
    }),
  );

  return NextResponse.json({ meetings });
}
