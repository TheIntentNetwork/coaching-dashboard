import { createAdminClient } from "@/lib/supabase/admin";
import {
  formatCents,
  parseSessionCountFromPlanName,
  type SessionBalance,
} from "@/lib/portal/session-grants";

type EnrollmentRow = {
  id: string;
  advisor_id: string;
  program: string | null;
  plan_name: string | null;
  sessions_included: number | null;
  sessions_consumed: number | null;
  extra_session_price_cents: number | null;
};

function toBalance(row: EnrollmentRow): SessionBalance {
  const included = Math.max(0, row.sessions_included ?? 0);
  const consumed = Math.max(0, row.sessions_consumed ?? 0);
  const extraCents = row.extra_session_price_cents ?? 19700;
  return {
    enrollmentId: row.id,
    advisorId: row.advisor_id,
    program: row.program,
    planName: row.plan_name,
    packageLabel: row.plan_name || "Session package",
    sessionsIncluded: included,
    sessionsConsumed: consumed,
    sessionsRemaining: Math.max(0, included - consumed),
    extraSessionPriceCents: extraCents,
    extraSessionPriceLabel: formatCents(extraCents),
  };
}

async function ensureSessionColumns(row: EnrollmentRow): Promise<EnrollmentRow> {
  if ((row.sessions_included ?? 0) > 0) return row;

  const inferred =
    parseSessionCountFromPlanName(row.plan_name) ??
    (row.program === "iep" ? 2 : row.program === "coaching" ? 8 : 1);
  const extra =
    row.program === "counseling" ? 17500 : 19700;

  const admin = createAdminClient();
  const { data } = await admin
    .from("advisor_enrollments")
    .update({
      sessions_included: inferred,
      sessions_consumed: row.sessions_consumed ?? 0,
      extra_session_price_cents: row.extra_session_price_cents ?? extra,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .select(
      "id, advisor_id, program, plan_name, sessions_included, sessions_consumed, extra_session_price_cents",
    )
    .maybeSingle();

  return (data as EnrollmentRow | null) ?? { ...row, sessions_included: inferred };
}

export async function getSessionBalanceForUser(
  userId: string,
  email?: string | null,
): Promise<SessionBalance | null> {
  const admin = createAdminClient();

  let query = admin
    .from("advisor_enrollments")
    .select(
      "id, advisor_id, program, plan_name, sessions_included, sessions_consumed, extra_session_price_cents",
    )
    .eq("client_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  let { data } = await query.maybeSingle();

  if (!data && email) {
    const byEmail = await admin
      .from("advisor_enrollments")
      .select(
        "id, advisor_id, program, plan_name, sessions_included, sessions_consumed, extra_session_price_cents",
      )
      .ilike("client_email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    data = byEmail.data;
  }

  if (!data) return null;

  const ensured = await ensureSessionColumns(data as EnrollmentRow);
  return toBalance(ensured);
}

export async function consumeSessionCredit(enrollmentId: string): Promise<SessionBalance> {
  const admin = createAdminClient();
  const { data: current, error } = await admin
    .from("advisor_enrollments")
    .select(
      "id, advisor_id, program, plan_name, sessions_included, sessions_consumed, extra_session_price_cents",
    )
    .eq("id", enrollmentId)
    .maybeSingle();

  if (error || !current) {
    throw new Error(error?.message || "Enrollment not found");
  }

  const balance = toBalance(current as EnrollmentRow);
  if (balance.sessionsRemaining <= 0) {
    throw new Error("No sessions remaining");
  }

  const { data: updated, error: updateError } = await admin
    .from("advisor_enrollments")
    .update({
      sessions_consumed: balance.sessionsConsumed + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", enrollmentId)
    .select(
      "id, advisor_id, program, plan_name, sessions_included, sessions_consumed, extra_session_price_cents",
    )
    .maybeSingle();

  if (updateError || !updated) {
    throw new Error(updateError?.message || "Failed to consume session");
  }

  return toBalance(updated as EnrollmentRow);
}

export async function grantExtraSession(enrollmentId: string, count = 1): Promise<SessionBalance> {
  const admin = createAdminClient();
  const { data: current, error } = await admin
    .from("advisor_enrollments")
    .select(
      "id, advisor_id, program, plan_name, sessions_included, sessions_consumed, extra_session_price_cents",
    )
    .eq("id", enrollmentId)
    .maybeSingle();

  if (error || !current) {
    throw new Error(error?.message || "Enrollment not found");
  }

  const balance = toBalance(current as EnrollmentRow);
  const { data: updated, error: updateError } = await admin
    .from("advisor_enrollments")
    .update({
      sessions_included: balance.sessionsIncluded + count,
      updated_at: new Date().toISOString(),
    })
    .eq("id", enrollmentId)
    .select(
      "id, advisor_id, program, plan_name, sessions_included, sessions_consumed, extra_session_price_cents",
    )
    .maybeSingle();

  if (updateError || !updated) {
    throw new Error(updateError?.message || "Failed to grant session");
  }

  return toBalance(updated as EnrollmentRow);
}
