import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveServiceType } from "@/lib/auth/service-type";
import { processPortalDocument } from "@/lib/documents/process-document";

const BUCKET = "portal-documents";
const MAX_BYTES = 50 * 1024 * 1024;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("portal_documents")
    .select("id, name, mime_type, status, error_message, byte_size, purpose, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ documents: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const purposeRaw = form.get("purpose");
  const purpose = typeof purposeRaw === "string" && purposeRaw.trim() ? purposeRaw.trim() : "general";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json(
      { error: "Only PDF files are accepted." },
      { status: 400 },
    );
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 50MB" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("service_type")
    .eq("id", user.id)
    .maybeSingle();

  const serviceType = resolveServiceType(profile?.service_type);
  const portalService =
    serviceType === "iep" || serviceType === "coaching" ? serviceType : "iep";

  const docId = crypto.randomUUID();
  const safeName = file.name.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 180);
  const storagePath = `${user.id}/${docId}/${safeName}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: row, error: insertError } = await supabase
    .from("portal_documents")
    .insert({
      id: docId,
      user_id: user.id,
      service_type: portalService,
      name: file.name,
      mime_type: file.type || null,
      storage_path: storagePath,
      byte_size: file.size,
      status: "uploaded",
      error_message: null,
      purpose,
    })
    .select(
      "id, name, mime_type, status, error_message, byte_size, purpose, created_at, updated_at",
    )
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  try {
    await processPortalDocument(docId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Embedding failed";
    const { data: failed } = await supabase
      .from("portal_documents")
      .select(
        "id, name, mime_type, status, error_message, byte_size, purpose, created_at, updated_at",
      )
      .eq("id", docId)
      .single();

    return NextResponse.json(
      {
        document: failed ?? row,
        warning: message,
      },
      { status: 201 },
    );
  }

  const { data: refreshed } = await supabase
    .from("portal_documents")
    .select(
      "id, name, mime_type, status, error_message, byte_size, purpose, created_at, updated_at",
    )
    .eq("id", docId)
    .single();

  return NextResponse.json({ document: refreshed ?? row }, { status: 201 });
}
