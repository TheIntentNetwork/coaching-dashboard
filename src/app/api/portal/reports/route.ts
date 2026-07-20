import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { getProfileEmail } from "@/lib/portal/server/profile";
import {
  fetchAppointmentsForUser,
  fetchUserMeetingSummary,
} from "@/lib/portal/server/meetings";
import { getMeetingType } from "@/lib/portal/meeting-types";

function formatReportDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
    const message = err instanceof Error ? err.message : "Failed to load reports";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const reports = (
    await Promise.all(
      appointments.map(async (appointment) => {
        const summary = await fetchUserMeetingSummary(appointment.id, user.id);
        if (!summary?.summary_markdown) return null;

        const meetingType = getMeetingType(appointment.appointmentType);
        const title =
          appointment.purpose ||
          meetingType?.label ||
          appointment.appointmentType ||
          "Meeting report";

        return {
          id: appointment.id,
          date: formatReportDate(appointment.startTime),
          name: title,
          meeting: appointment.advisorName
            ? `With ${appointment.advisorName}`
            : meetingType?.label || "Meeting",
          status: "Ready",
          hasSummary: true,
        };
      }),
    )
  ).filter((r): r is NonNullable<typeof r> => Boolean(r));

  return NextResponse.json({ reports });
}
