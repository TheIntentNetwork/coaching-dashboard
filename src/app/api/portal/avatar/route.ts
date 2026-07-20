import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "avatars";
const MAX_BYTES = 5 * 1024 * 1024;

function isAllowedAvatar(file: File): boolean {
  const name = file.name.toLowerCase();
  const mime = (file.type || "").toLowerCase();
  if (mime === "image/png" || name.endsWith(".png")) return true;
  if (mime === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg")) return true;
  if (mime === "image/webp" || name.endsWith(".webp")) return true;
  return false;
}

function extFor(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".png") || file.type === "image/png") return "png";
  if (name.endsWith(".webp") || file.type === "image/webp") return "webp";
  return "jpg";
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
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!isAllowedAvatar(file)) {
    return NextResponse.json(
      { error: "Only PNG, JPG, or WebP images are accepted." },
      { status: 400 },
    );
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be between 1 byte and 5MB" }, { status: 400 });
  }

  const ext = extFor(file);
  // Policies on `avatars` allow authenticated upload/update; path includes user id.
  const storagePath = `${user.id}/avatar.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType: file.type || `image/${ext}`,
    upsert: true,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  const avatarUrl = `${publicUrl.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return NextResponse.json({ avatarUrl });
}
