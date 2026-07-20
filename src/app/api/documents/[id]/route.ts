import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "portal-documents";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: doc, error } = await supabase
    .from("portal_documents")
    .select("id, name, storage_path, mime_type")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(doc.storage_path, 60 * 10);

  if (signError || !signed?.signedUrl) {
    return NextResponse.json(
      { error: signError?.message || "Could not sign URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: doc.id,
    name: doc.name,
    mimeType: doc.mime_type,
    url: signed.signedUrl,
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: doc, error } = await supabase
    .from("portal_documents")
    .select("id, storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await supabase.storage.from(BUCKET).remove([doc.storage_path]);
  const { error: deleteError } = await supabase
    .from("portal_documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
