import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";

export async function GET(request: Request) {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const order = new URL(request.url).searchParams.get("order") === "asc" ? "asc" : "desc";

  const { data, error } = await supabase
    .from("portal_timeline_events")
    .select("*")
    .eq("user_id", user.id)
    .order("event_at", { ascending: order === "asc" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}
