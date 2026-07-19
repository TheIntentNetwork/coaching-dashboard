import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { createClient } from "@/lib/supabase/server";

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type AuthResult = { user: User; error?: undefined } | { user?: undefined; error: NextResponse };

export async function requireUser(supabase: SupabaseServerClient): Promise<AuthResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user };
}
