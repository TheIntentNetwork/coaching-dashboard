import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { getPrepTemplate } from "@/lib/portal/prep-templates";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const { data, error } = await supabase
    .from("portal_prep_items")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

type PrepBody = {
  action: "create" | "apply_template";
  item_type?: "question" | "note" | "checklist";
  title?: string | null;
  body?: string;
  template_key?: string;
  replace?: boolean;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  let payload: PrepBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.action === "apply_template") {
    if (!payload.template_key) {
      return NextResponse.json({ error: "template_key is required" }, { status: 400 });
    }

    const template = getPrepTemplate(payload.template_key);
    if (!template) {
      return NextResponse.json({ error: "Unknown template_key" }, { status: 404 });
    }

    const replace = payload.replace !== false;
    if (replace) {
      const { error: deleteError } = await supabase
        .from("portal_prep_items")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    const rows = template.items.map((item, index) => ({
      user_id: user.id,
      item_type: item.item_type,
      title: item.title ?? null,
      body: item.body,
      sort_order: index,
      template_key: template.key,
    }));

    const { data, error } = await supabase.from("portal_prep_items").insert(rows).select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] }, { status: 201 });
  }

  if (payload.action === "create") {
    if (!payload.item_type || !payload.body) {
      return NextResponse.json({ error: "item_type and body are required" }, { status: 400 });
    }

    const { data: maxRow } = await supabase
      .from("portal_prep_items")
      .select("sort_order")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSortOrder = (maxRow?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from("portal_prep_items")
      .insert({
        user_id: user.id,
        item_type: payload.item_type,
        title: payload.title ?? null,
        body: payload.body,
        sort_order: nextSortOrder,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}

type PrepPatchBody = {
  id: string;
  title?: string | null;
  body?: string;
  checked?: boolean;
  sort_order?: number;
};

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  let payload: PrepPatchBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (payload.title !== undefined) patch.title = payload.title;
  if (payload.body !== undefined) patch.body = payload.body;
  if (payload.checked !== undefined) patch.checked = payload.checked;
  if (payload.sort_order !== undefined) patch.sort_order = payload.sort_order;

  const { data, error } = await supabase
    .from("portal_prep_items")
    .update(patch)
    .eq("id", payload.id)
    .eq("user_id", user.id)
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

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("portal_prep_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
