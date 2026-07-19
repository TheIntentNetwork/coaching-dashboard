import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppOrigin, getStripe } from "@/lib/stripe";
import { formatCents } from "@/lib/portal/session-grants";

type Body = { intentId?: string };

export async function POST(request: Request) {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.intentId) {
    return NextResponse.json({ error: "intentId is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: intent, error } = await admin
    .from("portal_booking_intents")
    .select("*")
    .eq("id", body.intentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !intent) {
    return NextResponse.json({ error: "Booking intent not found" }, { status: 404 });
  }

  if (intent.status === "booked") {
    return NextResponse.json({
      alreadyBooked: true,
      appointmentId: intent.appointment_id,
    });
  }

  const amountCents = intent.amount_cents || 19700;
  const origin = getAppOrigin();
  const stripe = getStripe();

  const successParams = new URLSearchParams({
    intent_id: intent.id,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: "Extra advocacy / coaching session",
            description: intent.purpose
              ? `Session booking: ${intent.purpose}`
              : "Additional session for your package",
          },
        },
      },
    ],
    success_url: `${origin}/advocate/success?${successParams.toString()}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/advocate/payment?intent_id=${intent.id}`,
    metadata: {
      enrollment_type: "portal_session_booking",
      intent_id: intent.id,
      user_id: user.id,
      advisor_id: intent.advisor_id,
      enrollment_id: intent.enrollment_id || "",
    },
  });

  await admin
    .from("portal_booking_intents")
    .update({
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", intent.id);

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 500 });
  }

  return NextResponse.json({
    checkoutUrl: session.url,
    sessionId: session.id,
    amountCents,
    amountLabel: formatCents(amountCents),
  });
}
