import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { createBookingOrPaymentIntent } from "@/lib/portal/server/booking";

type Body = {
  date?: string;
  time?: string;
  purpose?: string;
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

  if (!body.date || !body.time || !body.purpose) {
    return NextResponse.json(
      { error: "date, time, and purpose are required" },
      { status: 400 },
    );
  }

  try {
    const result = await createBookingOrPaymentIntent(supabase, user.id, {
      date: body.date,
      time: body.time,
      purpose: body.purpose,
    });
    return NextResponse.json(result, { status: result.mode === "booked" ? 201 : 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Booking failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
