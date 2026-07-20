import { createAdminClient } from "@/lib/supabase/admin";
import type { PortalAdvocate } from "@/lib/portal/types";

/**
 * advisor_enrollments and advisors have no client-facing RLS policies, so
 * resolving a client's assigned advisor requires the service-role client.
 */
export async function resolveAdvisorId(
  userId: string,
  email?: string | null,
): Promise<string | null> {
  const admin = createAdminClient();

  const { data: byUser } = await admin
    .from("advisor_enrollments")
    .select("advisor_id")
    .eq("client_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byUser?.advisor_id) return byUser.advisor_id as string;

  if (email) {
    const { data: byEmail } = await admin
      .from("advisor_enrollments")
      .select("advisor_id")
      .ilike("client_email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (byEmail?.advisor_id) return byEmail.advisor_id as string;
  }

  // Fallback: advisor from the most recent appointment for this client.
  const { data: byUserAppointment } = await admin
    .from("appointments")
    .select("advisor_id")
    .eq("veteran_user_id", userId)
    .not("advisor_id", "is", null)
    .order("start_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byUserAppointment?.advisor_id) {
    return byUserAppointment.advisor_id as string;
  }

  if (email) {
    const { data: byEmailAppointment } = await admin
      .from("appointments")
      .select("advisor_id")
      .eq("veteran_email", email.trim().toLowerCase())
      .not("advisor_id", "is", null)
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (byEmailAppointment?.advisor_id) {
      return byEmailAppointment.advisor_id as string;
    }
  }

  return null;
}

export async function getAdvocateForUser(
  userId: string,
  email?: string | null,
): Promise<PortalAdvocate | null> {
  const advisorId = await resolveAdvisorId(userId, email);
  if (!advisorId) return null;

  const admin = createAdminClient();

  const { data: advisor } = await admin
    .from("advisors")
    .select("id, first_name, last_name, email, phone, bio, profile_picture_url, primary_program")
    .eq("id", advisorId)
    .maybeSingle();

  if (!advisor) return null;

  const { data: advisorProfile } = await admin
    .from("advisor_profiles")
    .select("title, bio, avatar_url, is_default")
    .eq("advisor_id", advisorId)
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    advisorId: advisor.id,
    name: `${advisor.first_name} ${advisor.last_name}`.trim(),
    email: advisor.email ?? null,
    phone: advisor.phone ?? null,
    bio: advisor.bio || advisorProfile?.bio || null,
    avatarUrl: advisor.profile_picture_url || advisorProfile?.avatar_url || null,
    title: advisorProfile?.title ?? null,
    program: advisor.primary_program ?? null,
  };
}
