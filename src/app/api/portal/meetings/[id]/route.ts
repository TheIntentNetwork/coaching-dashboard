import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { getProfileEmail } from "@/lib/portal/server/profile";
import {
  fetchAppointmentForUser,
  fetchUserMeetingSummary,
  meetingHasUserSummary,
} from "@/lib/portal/server/meetings";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const email = await getProfileEmail(supabase, user.id);

  let meeting;
  try {
    meeting = await fetchAppointmentForUser(id, user.id, email);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load meeting";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!meeting) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const summary = await fetchUserMeetingSummary(meeting.id, user.id);

  return NextResponse.json({
    meeting: {
      ...meeting,
      summary: meetingHasUserSummary(summary) ? summary : null,
    },
  });
}
