import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptField, isEncryptedField } from "@/lib/encryption";

/** Base URL of sustainable-website (hosts /meeting/[id]?token=...). */
export function getMeetingBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_MEETING_BASE_URL?.trim() ||
    process.env.MEETING_BASE_URL?.trim() ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "");
  return raw.replace(/\/$/, "");
}

export function generateMeetingToken(): string {
  return randomBytes(32).toString("hex");
}

export function buildGuestMeetingLink(
  appointmentId: string,
  meetingToken: string,
  baseUrl = getMeetingBaseUrl(),
): string {
  const origin = baseUrl || getMeetingBaseUrl();
  if (!origin) {
    return `/meeting/${appointmentId}?token=${meetingToken}`;
  }
  return `${origin}/meeting/${appointmentId}?token=${meetingToken}`;
}

/** Decrypt stored link or rebuild from token when possible. */
export function resolveMeetingLink(params: {
  appointmentId: string;
  meetingLink: string | null | undefined;
  meetingToken: string | null | undefined;
}): string | null {
  let link = params.meetingLink ?? null;
  if (isEncryptedField(link)) {
    link = decryptField(link);
  }

  if (link) {
    if (link.startsWith("http://") || link.startsWith("https://")) return link;
    const base = getMeetingBaseUrl();
    if (base && link.startsWith("/")) return `${base}${link}`;
    return link;
  }

  if (params.meetingToken) {
    return buildGuestMeetingLink(params.appointmentId, params.meetingToken);
  }

  return null;
}

/**
 * Ensure a scheduled/in-progress appointment has meeting_token + absolute meeting_link.
 * Returns the join URL for the client portal.
 */
export async function ensureAppointmentJoinCredentials(
  appointmentId: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("appointments")
    .select("id, status, meeting_token, meeting_link")
    .eq("id", appointmentId)
    .maybeSingle();

  if (error || !data) return null;

  const resolved = resolveMeetingLink({
    appointmentId: data.id,
    meetingLink: data.meeting_link,
    meetingToken: data.meeting_token,
  });

  if (data.status !== "scheduled" && data.status !== "in_progress") {
    return resolved;
  }

  if (data.meeting_token && resolved?.startsWith("http")) {
    const storedPlain = isEncryptedField(data.meeting_link)
      ? decryptField(data.meeting_link)
      : data.meeting_link;
    if (!storedPlain || storedPlain.startsWith("/")) {
      await admin
        .from("appointments")
        .update({ meeting_link: resolved })
        .eq("id", data.id);
    }
    return resolved;
  }

  const token = data.meeting_token || generateMeetingToken();
  const link = buildGuestMeetingLink(data.id, token);

  await admin
    .from("appointments")
    .update({
      meeting_token: token,
      meeting_link: link,
    })
    .eq("id", data.id);

  return link;
}
