import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { getProfileEmail, getProfileDisplayName } from "@/lib/portal/server/profile";
import {
  fetchAppointmentForUser,
  fetchUserMeetingSummary,
} from "@/lib/portal/server/meetings";
import { getMeetingType } from "@/lib/portal/meeting-types";

function formatIssueDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const email = await getProfileEmail(supabase, user.id);
  const displayName = await getProfileDisplayName(supabase, user.id);

  let appointment;
  try {
    appointment = await fetchAppointmentForUser(id, user.id, email);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load report";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!appointment) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const summary = await fetchUserMeetingSummary(appointment.id, user.id);
  const meetingType = getMeetingType(appointment.appointmentType);
  const title =
    appointment.purpose ||
    meetingType?.label ||
    appointment.appointmentType ||
    "Meeting report";

  return NextResponse.json({
    report: {
      id: appointment.id,
      title,
      issueDate: formatIssueDate(appointment.completedAt || appointment.startTime),
      clientName: displayName,
      advisorName: appointment.advisorName,
      meetingType: meetingType?.label || appointment.appointmentType,
      status: appointment.status,
      summaryMarkdown: summary?.summary_markdown || null,
      questions: summary?.questions_json ?? null,
      notes: summary?.notes_json ?? null,
      checklist: summary?.checklist_json ?? null,
      updatedAt: summary?.updated_at || null,
    },
  });
}
