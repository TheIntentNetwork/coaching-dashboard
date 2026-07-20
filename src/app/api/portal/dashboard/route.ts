import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { resolvePortalTheme, resolveServiceType } from "@/lib/auth/service-type";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("service_type")
    .eq("id", user.id)
    .maybeSingle();

  const theme = resolvePortalTheme(resolveServiceType(profile?.service_type));

  const { data: setup, error } = await supabase
    .from("portal_setup")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const [
    docsRes,
    accommodationsRes,
    compensatoryRes,
    journeyRes,
    prepRes,
    timelineRes,
  ] = await Promise.all([
    supabase
      .from("portal_documents")
      .select("id, purpose", { count: "exact", head: false })
      .eq("user_id", user.id)
      .limit(50),
    theme === "iep"
      ? supabase
          .from("portal_accommodations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
      : Promise.resolve({ count: 0, error: null }),
    theme === "iep"
      ? supabase
          .from("portal_compensatory_plans")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
      : Promise.resolve({ count: 0, error: null }),
    theme === "iep"
      ? supabase
          .from("portal_iep_journey")
          .select("milestones")
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("portal_prep_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("portal_timeline_events")
      .select("title, event_at")
      .eq("user_id", user.id)
      .order("event_at", { ascending: false })
      .limit(1),
  ]);

  const documents = docsRes.data || [];
  const hasDocuments = documents.length > 0;
  const hasIepDraft =
    Boolean(setup?.draft_document_id) ||
    documents.some((d) => d.purpose === "iep_draft");

  let journeyTouched = false;
  const milestones = journeyRes.data?.milestones;
  if (Array.isArray(milestones)) {
    journeyTouched = milestones.some(
      (m) => m && typeof m === "object" && Boolean((m as { done?: boolean }).done),
    );
  }

  const meetingType = getMeetingType(setup?.meeting_type);
  const dueLabel = formatDueLabel(setup?.meeting_date);
  const hasMeeting = Boolean(setup?.meeting_date);

  const priority = hasMeeting
    ? {
        title: meetingType ? `Prepare for your ${meetingType.shortTitle}` : "Prepare for your meeting",
        description: meetingType?.prepFocus ?? "Review your prep kit before the meeting.",
        href: "/case-file/prep",
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

  const latestTimelineTitle = timelineRes.data?.[0]?.title || null;

  return NextResponse.json({
    setup: setup ?? null,
    meetingType,
    dueLabel,
    priority,
    upcomingMeeting,
    studentName: setup?.student_name ?? null,
    caseProgress: {
      hasDocuments,
      hasIepDraft,
      meetingScheduled: hasMeeting,
      hasAccommodations: (accommodationsRes.count || 0) > 0,
      hasCompensatory: (compensatoryRes.count || 0) > 0,
      journeyTouched,
      hasPrep: (prepRes.count || 0) > 0,
      includeIepDomain: theme === "iep",
      latestStatusLabel: latestTimelineTitle
        ? latestTimelineTitle
        : hasMeeting
          ? "Meeting scheduled"
          : "Getting started",
    },
  });
}
