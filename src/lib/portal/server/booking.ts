import { createAdminClient } from "@/lib/supabase/admin";
import {
  consumeSessionCredit,
  getSessionBalanceForUser,
  grantExtraSession,
} from "@/lib/portal/server/sessions";
import { getProfileDisplayName, getProfileEmail } from "@/lib/portal/server/profile";
import type { SupabaseServerClient } from "@/lib/portal/server/auth";

const DEFAULT_DURATION_MINUTES = 60;

export type BookingRequest = {
  date: string; // YYYY-MM-DD
  time: string; // e.g. 10:30 AM
  purpose: string;
};

export type BookingResult =
  | {
      mode: "booked";
      appointmentId: string;
      startTime: string;
      endTime: string;
      purpose: string;
      advocateName: string | null;
      balance: Awaited<ReturnType<typeof getSessionBalanceForUser>>;
    }
  | {
      mode: "payment_required";
      intentId: string;
      amountCents: number;
      amountLabel: string;
      startTime: string;
      endTime: string;
      purpose: string;
      advocateName: string | null;
      balance: NonNullable<Awaited<ReturnType<typeof getSessionBalanceForUser>>>;
    };

function parseLocalDateTime(date: string, time: string): Date {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error("Invalid time format");
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) throw new Error("Invalid date format");
  const local = new Date(y, m - 1, d, hour, minute, 0, 0);
  if (Number.isNaN(local.getTime())) throw new Error("Invalid date/time");
  return local;
}

async function getAdvisorName(advisorId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("advisors")
    .select("first_name, last_name")
    .eq("id", advisorId)
    .maybeSingle();
  if (!data) return null;
  return `${data.first_name || ""} ${data.last_name || ""}`.trim() || null;
}

async function createAppointment(params: {
  advisorId: string;
  userId: string;
  email: string | null;
  displayName: string;
  start: Date;
  end: Date;
  purpose: string;
}): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("appointments")
    .insert({
      advisor_id: params.advisorId,
      veteran_user_id: params.userId,
      veteran_email: params.email,
      veteran_name: params.displayName,
      start_time: params.start.toISOString(),
      end_time: params.end.toISOString(),
      duration_minutes: DEFAULT_DURATION_MINUTES,
      appointment_type: "portal_booking",
      status: "scheduled",
      purpose: params.purpose,
      scheduled_by: params.userId,
      extra_data: { source: "brand_portal" },
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to create appointment");
  }
  return data.id as string;
}

export async function createBookingOrPaymentIntent(
  supabase: SupabaseServerClient,
  userId: string,
  request: BookingRequest,
): Promise<BookingResult> {
  const email = await getProfileEmail(supabase, userId);
  const displayName =
    (await getProfileDisplayName(supabase, userId)) || "Client";
  const balance = await getSessionBalanceForUser(userId, email);

  if (!balance) {
    throw new Error(
      "No enrollment found. Your advocate must enroll you before you can book meetings.",
    );
  }

  const start = parseLocalDateTime(request.date, request.time);
  if (start.getTime() < Date.now() + 60 * 60 * 1000) {
    throw new Error("Please choose a time at least 1 hour from now.");
  }
  const end = new Date(start.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000);
  const purpose = request.purpose.trim() || "Meeting";
  const advocateName = await getAdvisorName(balance.advisorId);

  if (balance.sessionsRemaining > 0) {
    const appointmentId = await createAppointment({
      advisorId: balance.advisorId,
      userId,
      email,
      displayName,
      start,
      end,
      purpose,
    });
    const nextBalance = await consumeSessionCredit(balance.enrollmentId);
    return {
      mode: "booked",
      appointmentId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      purpose,
      advocateName,
      balance: nextBalance,
    };
  }

  const admin = createAdminClient();
  const { data: intent, error } = await admin
    .from("portal_booking_intents")
    .insert({
      user_id: userId,
      advisor_id: balance.advisorId,
      enrollment_id: balance.enrollmentId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      purpose,
      status: "pending_payment",
      amount_cents: balance.extraSessionPriceCents,
    })
    .select("id")
    .single();

  if (error || !intent) {
    throw new Error(error?.message || "Failed to create payment intent");
  }

  return {
    mode: "payment_required",
    intentId: intent.id as string,
    amountCents: balance.extraSessionPriceCents,
    amountLabel: balance.extraSessionPriceLabel,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    purpose,
    advocateName,
    balance,
  };
}

export async function fulfillPaidBookingIntent(intentId: string): Promise<{
  appointmentId: string;
  startTime: string;
  endTime: string;
  purpose: string | null;
  advocateName: string | null;
}> {
  const admin = createAdminClient();
  const { data: intent, error } = await admin
    .from("portal_booking_intents")
    .select("*")
    .eq("id", intentId)
    .maybeSingle();

  if (error || !intent) {
    throw new Error(error?.message || "Booking intent not found");
  }

  if (intent.status === "booked" && intent.appointment_id) {
    const advocateName = await getAdvisorName(intent.advisor_id);
    return {
      appointmentId: intent.appointment_id,
      startTime: intent.start_time,
      endTime: intent.end_time,
      purpose: intent.purpose,
      advocateName,
    };
  }

  if (!intent.enrollment_id) {
    throw new Error("Booking intent missing enrollment");
  }

  await grantExtraSession(intent.enrollment_id, 1);

  const { data: profile } = await admin
    .from("profiles")
    .select("email, name")
    .eq("id", intent.user_id)
    .maybeSingle();

  const appointmentId = await createAppointment({
    advisorId: intent.advisor_id,
    userId: intent.user_id,
    email: profile?.email ?? null,
    displayName: profile?.name || "Client",
    start: new Date(intent.start_time),
    end: new Date(intent.end_time),
    purpose: intent.purpose || "Meeting",
  });

  await consumeSessionCredit(intent.enrollment_id);

  await admin
    .from("portal_booking_intents")
    .update({
      status: "booked",
      appointment_id: appointmentId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", intentId);

  const advocateName = await getAdvisorName(intent.advisor_id);
  return {
    appointmentId,
    startTime: intent.start_time,
    endTime: intent.end_time,
    purpose: intent.purpose,
    advocateName,
  };
}
