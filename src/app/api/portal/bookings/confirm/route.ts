import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { fulfillPaidBookingIntent } from "@/lib/portal/server/booking";

type Body = {
  sessionId?: string;
  intentId?: string;
};

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

  let intentId = body.intentId || null;

  if (body.sessionId) {
    const session = await getStripe().checkout.sessions.retrieve(body.sessionId);
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }
    if (session.metadata?.user_id && session.metadata.user_id !== user.id) {
      return NextResponse.json({ error: "Session mismatch" }, { status: 403 });
    }
    intentId = session.metadata?.intent_id || intentId;
  }

  if (!intentId) {
    return NextResponse.json({ error: "intentId or sessionId required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: intent } = await admin
    .from("portal_booking_intents")
    .select("id, user_id")
    .eq("id", intentId)
    .maybeSingle();

  if (!intent || intent.user_id !== user.id) {
    return NextResponse.json({ error: "Booking intent not found" }, { status: 404 });
  }

  try {
    const result = await fulfillPaidBookingIntent(intentId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not confirm booking";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}