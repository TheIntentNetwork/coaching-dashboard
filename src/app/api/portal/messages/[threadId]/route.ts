import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { sendVeteranMessage } from "@/lib/portal/server/messages";

type Params = { params: Promise<{ threadId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { threadId } = await params;
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const { data: thread, error } = await supabase
    .from("message_threads")
    .select("*")
    .eq("id", threadId)
    .eq("veteran_user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: messages, error: messagesError } = await supabase
    .from("secure_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("sent_at", { ascending: true });

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  if (thread.unread_veteran_count > 0) {
    await supabase.from("message_threads").update({ unread_veteran_count: 0 }).eq("id", threadId);
    await supabase
      .from("secure_messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("thread_id", threadId)
      .eq("sender_type", "advisor")
      .eq("is_read", false);
  }

  return NextResponse.json({ thread, messages: messages ?? [] });
}

export async function POST(request: Request, { params }: Params) {
  const { threadId } = await params;
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  let payload: { body?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.body || !payload.body.trim()) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const result = await sendVeteranMessage(supabase, user.id, {
    body: payload.body,
    threadId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ thread: result.thread, message: result.message }, { status: 201 });
}
