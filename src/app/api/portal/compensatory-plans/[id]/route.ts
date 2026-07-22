import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;

  const { data: existing } = await supabase
    .from("portal_compensatory_plans")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    summary?: string | null;
    missed_services?: string | null;
    timeframe_start?: string | null;
    timeframe_end?: string | null;
    document_ids?: string[];
    submit?: boolean;
  };

  // Parents can edit their plans unless the advocate has closed the case.
  if (existing.status === "closed") {
    return NextResponse.json(
      { error: "This plan is closed and can no longer be edited" },
      { status: 400 },
    );
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    }
    patch.title = title;
  }
  if (body.summary !== undefined) {
    patch.summary = typeof body.summary === "string" ? body.summary.trim() || null : null;
  }
  if (body.missed_services !== undefined) {
    patch.missed_services =
      typeof body.missed_services === "string"
        ? body.missed_services.trim() || null
        : null;
  }
  if (body.timeframe_start !== undefined) patch.timeframe_start = body.timeframe_start || null;
  if (body.timeframe_end !== undefined) patch.timeframe_end = body.timeframe_end || null;
  if (Array.isArray(body.document_ids)) patch.document_ids = body.document_ids;

  const { data, error } = await supabase
    .from("portal_compensatory_plans")
    .update(patch)
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;

  const { data: existing } = await supabase
    .from("portal_compensatory_plans")
    .select("id, status")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.status === "closed") {
    return NextResponse.json(
      { error: "This plan is closed and can no longer be deleted" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("portal_compensatory_plans")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
