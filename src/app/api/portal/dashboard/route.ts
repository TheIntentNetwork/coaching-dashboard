import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/portal/server/auth";
import { resolvePortalTheme, resolveServiceType } from "@/lib/auth/service-type";
import {
  formatDueLabel,
  formatMeetingDateLabel,
  getMeetingType,
} from "@/lib/portal/meeting-types";
import { parseThirdPartyMeeting } from "@/lib/portal/third-party-meeting";
import { resolveMeetingLink } from "@/lib/portal/meeting-link";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const { data: profile } = await supabase
    .from("profiles")
    .select("service_type, name")
    .eq("id", user.id)
    .maybeSingle();

  const theme = resolvePortalTheme(resolveServiceType(profile?.service_type));

  const { data: setup, error } = await supabase
    .from("portal_setup")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: iepProfile } = await supabase
    .from("portal_iep_profiles")
    .select(
      "child_name, child_age, grade_level, school_district, current_iep_status, primary_disability, secondary_disabilities, current_challenges, iep_goals, services_received, accommodations_needed, behavioral_concerns, parent_concerns, additional_info",
    )
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

  let thirdPartyJoinUrl: string | null = null;
  let thirdPartyLabel: "zoom" | "meet" | "other" | null = null;
  let appointmentStartsAt: string | null = null;
  let resolvedAppointmentId: string | null = null;
  let copilotJoinUrl: string | null = null;
  try {
    const admin = createAdminClient();
    const appointmentId =
      typeof setup?.appointment_id === "string" ? setup.appointment_id : null;

    const applyAppointmentJoin = (
      row: {
        id?: string;
        extra_data?: unknown;
        start_time?: string;
        meeting_link?: string | null;
        meeting_token?: string | null;
      } | null,
    ) => {
      if (!row) return;
      if (typeof row.id === "string") resolvedAppointmentId = row.id;
      if (typeof row.start_time === "string") appointmentStartsAt = row.start_time;
      const parsed = parseThirdPartyMeeting(row.extra_data);
      if (parsed) {
        thirdPartyJoinUrl = parsed.url;
        thirdPartyLabel = parsed.label;
      }
      const copilot = resolveMeetingLink({
        appointmentId: String(row.id || resolvedAppointmentId || appointmentId || ""),
        meetingLink: row.meeting_link,
        meetingToken: row.meeting_token,
      });
      if (copilot) copilotJoinUrl = copilot;
    };

    if (appointmentId) {
      const { data: appt } = await admin
        .from("appointments")
        .select("id, extra_data, start_time, meeting_link, meeting_token")
        .eq("id", appointmentId)
        .maybeSingle();
      applyAppointmentJoin(appt);
    }

    if (!thirdPartyJoinUrl || !copilotJoinUrl) {
      const { data: nextAppt } = await admin
        .from("appointments")
        .select("id, extra_data, start_time, meeting_link, meeting_token")
        .eq("veteran_user_id", user.id)
        .eq("status", "scheduled")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (nextAppt) {
        if (!thirdPartyJoinUrl) {
          const parsed = parseThirdPartyMeeting(nextAppt.extra_data);
          if (parsed) {
            thirdPartyJoinUrl = parsed.url;
            thirdPartyLabel = parsed.label;
          }
        }
        if (!copilotJoinUrl || !resolvedAppointmentId) {
          applyAppointmentJoin(nextAppt);
        }
      }
    }
  } catch (thirdPartyError) {
    console.error("[portal/dashboard] meeting join lookup failed:", thirdPartyError);
  }

  const priority = hasMeeting
    ? {
        title: meetingType ? `Prepare for your ${meetingType.shortTitle}` : "Prepare for your meeting",
        description: meetingType?.prepFocus ?? "Review your prep kit before the meeting.",
        href: "/case-file/prep",
        dueLabel,
      }
    : null;

  const fallbackMeetingDate = (appointmentStartsAt ?? new Date().toISOString()).slice(0, 10);

  const upcomingMeeting = hasMeeting
    ? {
        meetingDate: setup!.meeting_date,
        startsAt: appointmentStartsAt,
        dateLabel: formatMeetingDateLabel(setup!.meeting_date),
        meetingType: meetingType?.label ?? setup!.meeting_type,
        focus: meetingType?.prepFocus ?? null,
        studentName: setup?.student_name ?? null,
        appointmentId: resolvedAppointmentId,
        copilotJoinUrl,
        thirdPartyJoinUrl,
        thirdPartyLabel,
      }
    : thirdPartyJoinUrl || copilotJoinUrl
      ? {
          meetingDate: fallbackMeetingDate,
          startsAt: appointmentStartsAt,
          dateLabel: "Scheduled",
          meetingType: "Meeting",
          focus: null,
          studentName: setup?.student_name ?? null,
          appointmentId: resolvedAppointmentId,
          copilotJoinUrl,
          thirdPartyJoinUrl,
          thirdPartyLabel,
        }
      : "still_not_set";

  const latestTimelineTitle = timelineRes.data?.[0]?.title || null;

  return NextResponse.json({
    setup: setup ?? null,
    meetingType,
    dueLabel,
    priority,
    upcomingMeeting,
    parentName: profile?.name ?? null,
    studentName: setup?.student_name ?? null,
    iepProfile: iepProfile
      ? {
          childName: iepProfile.child_name ?? null,
          childAge: iepProfile.child_age ?? null,
          gradeLevel: iepProfile.grade_level ?? null,
          schoolDistrict: iepProfile.school_district ?? null,
          currentIepStatus: iepProfile.current_iep_status ?? null,
          primaryDisability: iepProfile.primary_disability ?? null,
          secondaryDisabilities: iepProfile.secondary_disabilities ?? null,
          currentChallenges: iepProfile.current_challenges ?? null,
          iepGoals: iepProfile.iep_goals ?? null,
          servicesReceived: iepProfile.services_received ?? null,
          accommodationsNeeded: iepProfile.accommodations_needed ?? null,
          behavioralConcerns: iepProfile.behavioral_concerns ?? null,
          parentConcerns: iepProfile.parent_concerns ?? null,
          additionalInfo: iepProfile.additional_info ?? null,
        }
      : null,
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
