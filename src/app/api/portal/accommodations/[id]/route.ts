import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";

const KINDS = new Set(["accommodation", "supportive_service"]);
const STATUSES = new Set(["draft", "active", "archived"]);

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    description?: string | null;
    service_kind?: string;
    status?: string;
    document_ids?: string[];
  };

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
  if (body.description !== undefined) {
    patch.description =
      typeof body.description === "string" ? body.description.trim() || null : null;
  }
  if (body.service_kind !== undefined) {
    if (!KINDS.has(body.service_kind)) {
      return NextResponse.json({ error: "Invalid service_kind" }, { status: 400 });
    }
    patch.service_kind = body.service_kind;
  }
  if (body.status !== undefined) {
    if (!STATUSES.has(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (Array.isArray(body.document_ids)) {
    patch.document_ids = body.document_ids;
  }

  const { data, error } = await supabase
    .from("portal_accommodations")
    .update(patch)
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;

  const { error } = await supabase
    .from("portal_accommodations")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
