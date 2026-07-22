import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { insertTimelineEvent } from "@/lib/portal/server/timeline";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;

  const { data, error } = await supabase
    .from("portal_compensatory_plans")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    summary?: string | null;
    missed_services?: string | null;
    timeframe_start?: string | null;
    timeframe_end?: string | null;
    document_ids?: string[];
    submit?: boolean;
  };

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const status = "submitted";

  const { data, error } = await supabase
    .from("portal_compensatory_plans")
    .insert({
      user_id: auth.user.id,
      title,
      summary: body.summary?.trim() || null,
      missed_services: body.missed_services?.trim() || null,
      timeframe_start: body.timeframe_start || null,
      timeframe_end: body.timeframe_end || null,
      status,
      document_ids: Array.isArray(body.document_ids) ? body.document_ids : [],
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await insertTimelineEvent(supabase, auth.user.id, {
    eventType: "compensatory_submitted",
    title: "Compensatory plan added",
    body: title,
  });

  return NextResponse.json({ item: data }, { status: 201 });
}
