import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { getProfileEmail } from "@/lib/portal/server/profile";
import { resolveAdvisorId } from "@/lib/portal/server/advisor";
import { insertTimelineEvent, upsertUpcomingMeetingEvent } from "@/lib/portal/server/timeline";
import { getMeetingType } from "@/lib/portal/meeting-types";

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

  if (!setup) {
    return NextResponse.json({ setup: null });
  }

  if (!setup.advisor_id) {
    const email = await getProfileEmail(supabase, user.id);
    const advisorId = await resolveAdvisorId(user.id, email);

    if (advisorId) {
      const { data: updated } = await supabase
        .from("portal_setup")
        .update({ advisor_id: advisorId })
        .eq("user_id", user.id)
        .select("*")
        .maybeSingle();

      return NextResponse.json({ setup: updated ?? setup });
    }
  }

  return NextResponse.json({ setup });
}

type SetupBody = {
  student_name?: string | null;
  meeting_date?: string | null;
  meeting_type?: string | null;
  draft_document_id?: string | null;
  submit?: boolean;
};

async function upsertSetup(request: Request) {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  let body: SetupBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("portal_setup")
    .select("advisor_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let advisorId = existing?.advisor_id ?? null;
  if (!advisorId) {
    const email = await getProfileEmail(supabase, user.id);
    advisorId = await resolveAdvisorId(user.id, email);
  }

  const patch: Record<string, unknown> = { user_id: user.id };
  if (body.student_name !== undefined) patch.student_name = body.student_name;
  if (body.meeting_date !== undefined) patch.meeting_date = body.meeting_date;
  if (body.meeting_type !== undefined) patch.meeting_type = body.meeting_type;
  if (body.draft_document_id !== undefined) patch.draft_document_id = body.draft_document_id;
  if (advisorId) patch.advisor_id = advisorId;

  const submit = body.submit === true;
  if (submit) {
    patch.status = "submitted";
    patch.submitted_at = new Date().toISOString();
  }

  const { data: saved, error } = await supabase
    .from("portal_setup")
    .upsert(patch, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const meetingDate: string | null = saved.meeting_date;
  const meetingType: string | null = saved.meeting_type;
  const meetingTypeDef = getMeetingType(meetingType);

  if ((body.meeting_date !== undefined || body.meeting_type !== undefined) && meetingDate) {
    await upsertUpcomingMeetingEvent(supabase, user.id, {
      meetingDate,
      meetingTypeLabel: meetingTypeDef?.label ?? meetingType,
    });
  }

  if (submit) {
    await insertTimelineEvent(supabase, user.id, {
      eventType: "setup_submitted",
      title: "IEP setup submitted for review",
      body: saved.student_name ? `Submitted for ${saved.student_name}` : null,
    });

    if (body.draft_document_id) {
      await insertTimelineEvent(supabase, user.id, {
        eventType: "draft_uploaded",
        title: "IEP draft uploaded",
        meta: { document_id: body.draft_document_id },
      });
    }

    if (meetingDate && meetingTypeDef) {
      await insertTimelineEvent(supabase, user.id, {
        eventType: "meeting_confirmed",
        title: `${meetingTypeDef.label} confirmed`,
        body: meetingTypeDef.prepFocus,
        isUpcoming: true,
        eventAt: `${meetingDate}T12:00:00.000Z`,
        meta: { meeting_date: meetingDate, meeting_type: meetingType },
      });
    }
  }

  return NextResponse.json({ setup: saved });
}

export async function POST(request: Request) {
  return upsertSetup(request);
}

export async function PATCH(request: Request) {
  return upsertSetup(request);
}
