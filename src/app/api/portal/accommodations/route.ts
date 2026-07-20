import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";

const KINDS = new Set(["accommodation", "supportive_service"]);
const STATUSES = new Set(["draft", "active", "archived"]);

export async function GET() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;

  const { data, error } = await supabase
    .from("portal_accommodations")
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
    description?: string | null;
    service_kind?: string;
    status?: string;
    document_ids?: string[];
  };

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const serviceKind = body.service_kind || "accommodation";
  if (!KINDS.has(serviceKind)) {
    return NextResponse.json({ error: "Invalid service_kind" }, { status: 400 });
  }

  const status = body.status || "draft";
  if (!STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("portal_accommodations")
    .insert({
      user_id: auth.user.id,
      title,
      description: body.description?.trim() || null,
      service_kind: serviceKind,
      status,
      document_ids: Array.isArray(body.document_ids) ? body.document_ids : [],
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
