import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";

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

  const items = data ?? [];

  const questions = items
    .filter((item) => item.item_type === "question")
    .map((item) => ({
      id: item.id,
      text: item.body || item.title || "",
      asked: false,
    }));

  const notes = items
    .filter((item) => item.item_type === "note")
    .map((item) => ({
      id: item.id,
      text: item.body || item.title || "",
    }));

  const checklist = items
    .filter((item) => item.item_type === "checklist")
    .map((item) => ({
      id: item.id,
      label: item.title || item.body || "",
      checked: item.checked,
    }));

  return NextResponse.json({ questions, notes, checklist });
}
