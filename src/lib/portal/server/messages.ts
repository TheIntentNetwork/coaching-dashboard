import type { SupabaseServerClient } from "@/lib/portal/server/auth";
import { resolveAdvisorId } from "@/lib/portal/server/advisor";
import { getProfileDisplayName } from "@/lib/portal/server/profile";
import {
  resolvePortalTheme,
  resolveServiceType,
  SERVICE_COPY,
} from "@/lib/auth/service-type";

export type SendMessageResult =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { ok: true; thread: any; message: any }
  | { ok: false; error: string; status: number };

type SendMessageParams = {
  body: string;
  subject?: string | null;
  threadId?: string;
  email?: string | null;
};

async function coachNounForUser(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("service_type")
    .eq("id", userId)
    .maybeSingle();
  const theme = resolvePortalTheme(resolveServiceType(data?.service_type));
  return SERVICE_COPY[theme].coachNoun;
}

/**
 * Finds (or creates) the thread with the client's assigned advisor, appends a
 * "veteran" message, and keeps the thread preview/unread counters in sync.
 */
export async function sendVeteranMessage(
  supabase: SupabaseServerClient,
  userId: string,
  params: SendMessageParams,
): Promise<SendMessageResult> {
  const body = params.body.trim();
  if (!body) {
    return { ok: false, error: "body is required", status: 400 };
  }

  let thread;

  if (params.threadId) {
    const { data, error } = await supabase
      .from("message_threads")
      .select("*")
      .eq("id", params.threadId)
      .eq("veteran_user_id", userId)
      .maybeSingle();

    if (error) return { ok: false, error: error.message, status: 500 };
    if (!data) return { ok: false, error: "Thread not found", status: 404 };
    thread = data;
  } else {
    const advisorId = await resolveAdvisorId(userId, params.email ?? null);
    const noun = await coachNounForUser(supabase, userId);
    if (!advisorId) {
      return {
        ok: false,
        error: `No assigned ${noun} yet. Your ${noun} is assigned when an advisor enrolls you.`,
        status: 400,
      };
    }

    const { data: existing } = await supabase
      .from("message_threads")
      .select("*")
      .eq("veteran_user_id", userId)
      .eq("advisor_id", advisorId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      thread = existing;
    } else {
      const displayName = await getProfileDisplayName(supabase, userId);
      const { data: created, error: createError } = await supabase
        .from("message_threads")
        .insert({
          veteran_user_id: userId,
          advisor_id: advisorId,
          subject: params.subject || `Message to your ${noun}`,
          veteran_display_name: displayName,
          created_by_type: "veteran",
        })
        .select("*")
        .single();

      if (createError) return { ok: false, error: createError.message, status: 500 };
      thread = created;
    }
  }

  // Max 2 consecutive client messages until the advocate/coach replies.
  const noun = await coachNounForUser(supabase, userId);
  const { data: recent } = await supabase
    .from("secure_messages")
    .select("sender_type")
    .eq("thread_id", thread.id)
    .order("sent_at", { ascending: false })
    .limit(2);

  let streak = 0;
  for (const m of recent || []) {
    if (m.sender_type !== "veteran") break;
    streak += 1;
  }
  if (streak >= 2) {
    return {
      ok: false,
      error: `You can send up to 2 messages at a time. Please wait for your ${noun} to reply.`,
      status: 429,
    };
  }

  const { data: message, error: messageError } = await supabase
    .from("secure_messages")
    .insert({
      thread_id: thread.id,
      sender_user_id: userId,
      sender_type: "veteran",
      message_body: body,
    })
    .select("*")
    .single();

  if (messageError) return { ok: false, error: messageError.message, status: 500 };

  const { data: updatedThread, error: updateError } = await supabase
    .from("message_threads")
    .update({
      last_message_at: message.sent_at,
      last_message_preview: body.slice(0, 140),
      message_count: (thread.message_count ?? 0) + 1,
      unread_advisor_count: (thread.unread_advisor_count ?? 0) + 1,
    })
    .eq("id", thread.id)
    .select("*")
    .single();

  if (updateError) return { ok: false, error: updateError.message, status: 500 };

  return { ok: true, thread: updatedThread, message };
}
