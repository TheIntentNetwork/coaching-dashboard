import type { SupabaseServerClient } from "@/lib/portal/server/auth";

type TimelineEventInput = {
  eventType: string;
  title: string;
  body?: string | null;
  eventAt?: string;
  isUpcoming?: boolean;
  meta?: Record<string, unknown>;
};

export async function insertTimelineEvent(
  supabase: SupabaseServerClient,
  userId: string,
  event: TimelineEventInput,
) {
  return supabase.from("portal_timeline_events").insert({
    user_id: userId,
    event_type: event.eventType,
    title: event.title,
    body: event.body ?? null,
    event_at: event.eventAt ?? new Date().toISOString(),
    is_upcoming: event.isUpcoming ?? false,
    meta: event.meta ?? {},
  });
}

/** Keeps a single "meeting_scheduled" upcoming event in sync instead of duplicating it on every save. */
export async function upsertUpcomingMeetingEvent(
  supabase: SupabaseServerClient,
  userId: string,
  params: { meetingDate: string; meetingTypeLabel: string | null },
) {
  const { data: existing } = await supabase
    .from("portal_timeline_events")
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", "meeting_scheduled")
    .eq("is_upcoming", true)
    .maybeSingle();

  const title = params.meetingTypeLabel
    ? `${params.meetingTypeLabel} scheduled`
    : "Meeting scheduled";
  const eventAt = `${params.meetingDate}T12:00:00.000Z`;
  const meta = { meeting_date: params.meetingDate, meeting_type: params.meetingTypeLabel };

  if (existing?.id) {
    return supabase
      .from("portal_timeline_events")
      .update({ title, event_at: eventAt, meta })
      .eq("id", existing.id);
  }

  return insertTimelineEvent(supabase, userId, {
    eventType: "meeting_scheduled",
    title,
    isUpcoming: true,
    eventAt,
    meta,
  });
}
