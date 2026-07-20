import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { fulfillPaidBookingIntent } from "@/lib/portal/server/booking";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.enrollment_type === "portal_session_booking") {
      const intentId = session.metadata.intent_id;
      if (intentId) {
        try {
          await fulfillPaidBookingIntent(intentId);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Fulfillment failed";
          console.error("[Stripe Webhook] portal booking fulfillment failed:", message);
          return NextResponse.json({ error: message }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
