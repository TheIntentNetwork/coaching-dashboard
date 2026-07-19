import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import {
  formatDueLabel,
  formatMeetingDateLabel,
  getMeetingType,
} from "@/lib/portal/meeting-types";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const { data: setup, error } = await supabase
    .from("portal_setup")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const meetingType = getMeetingType(setup?.meeting_type);
  const dueLabel = formatDueLabel(setup?.meeting_date);
  const hasMeeting = Boolean(setup?.meeting_date);

  const priority = hasMeeting
    ? {
        title: meetingType ? `Prepare for your ${meetingType.shortTitle}` : "Prepare for your meeting",
        description: meetingType?.prepFocus ?? "Review your prep kit before the meeting.",
        href: "/sustainbl/prep",
        dueLabel,
      }
    : null;

  const upcomingMeeting = hasMeeting
    ? {
        meetingDate: setup!.meeting_date,
        dateLabel: formatMeetingDateLabel(setup!.meeting_date),
        meetingType: meetingType?.label ?? setup!.meeting_type,
        focus: meetingType?.prepFocus ?? null,
        studentName: setup?.student_name ?? null,
      }
    : "still_not_set";

  return NextResponse.json({
    setup: setup ?? null,
    meetingType,
    dueLabel,
    priority,
    upcomingMeeting,
    studentName: setup?.student_name ?? null,
  });
}
