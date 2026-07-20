import type { SupabaseServerClient } from "@/lib/portal/server/auth";

export async function getProfileEmail(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  return data?.email ?? null;
}

export async function getProfileDisplayName(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("name, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return null;
  if (data.name) return data.name;

  const combined = [data.first_name, data.last_name].filter(Boolean).join(" ").trim();
  return combined || null;
}
