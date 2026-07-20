import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { getProfileEmail } from "@/lib/portal/server/profile";
import { sendVeteranMessage } from "@/lib/portal/server/messages";

type AdvisorRef = { id: string; first_name: string; last_name: string };

export async function GET() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const { data: threads, error } = await supabase
    .from("message_threads")
    .select("*, advisors ( id, first_name, last_name )")
    .eq("veteran_user_id", user.id)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const list = threads ?? [];
  const first = list[0];
  let firstThreadMessages: unknown[] = [];

  if (first) {
    const { data: messages } = await supabase
      .from("secure_messages")
      .select("*")
      .eq("thread_id", first.id)
      .order("sent_at", { ascending: true });

    firstThreadMessages = messages ?? [];
  }

  const shaped = list.map((thread, index) => {
    const advisorRef = thread.advisors as AdvisorRef | AdvisorRef[] | null;
    const advisor = Array.isArray(advisorRef) ? advisorRef[0] : advisorRef;

    return {
      id: thread.id,
      subject: thread.subject,
      status: thread.status,
      lastMessageAt: thread.last_message_at,
      lastMessagePreview: thread.last_message_preview,
      messageCount: thread.message_count,
      unreadCount: thread.unread_veteran_count,
      advisorName: advisor
        ? `${advisor.first_name} ${advisor.last_name}`.trim()
        : thread.advisor_display_name,
      messages: index === 0 ? firstThreadMessages : undefined,
    };
  });

  return NextResponse.json({ threads: shaped });
}

type MessagesPostBody = { body?: string; subject?: string };

export async function POST(request: Request) {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  let payload: MessagesPostBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.body || !payload.body.trim()) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const email = await getProfileEmail(supabase, user.id);
  const result = await sendVeteranMessage(supabase, user.id, {
    body: payload.body,
    subject: payload.subject,
    email,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ thread: result.thread, message: result.message }, { status: 201 });
}
