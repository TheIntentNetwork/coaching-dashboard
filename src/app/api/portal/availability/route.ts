import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { getProfileEmail } from "@/lib/portal/server/profile";
import { resolveAdvisorId } from "@/lib/portal/server/advisor";
import { getAdvocateAvailableDays } from "@/lib/portal/server/availability";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const email = await getProfileEmail(supabase, user.id);
  const advisorId = await resolveAdvisorId(user.id, email);
  if (!advisorId) {
    return NextResponse.json({ days: [], advisorId: null });
  }

  const days = await getAdvocateAvailableDays(advisorId);
  return NextResponse.json({ days, advisorId });
}
