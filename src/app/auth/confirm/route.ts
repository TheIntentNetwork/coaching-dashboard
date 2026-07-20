import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handle recovery / invite links from enrollment emails.
 * Verifies token_hash server-side, then sends the user to set their password.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/update-password";

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/sign-in?error=invalid-confirmation`);
  }

  const supabase = await createClient();
  const typeCandidates: EmailOtpType[] =
    type === "invite" || type === "signup"
      ? [type, "invite", "signup", "recovery", "email"]
      : type === "recovery"
        ? ["recovery", "email"]
        : [type];

  const uniqueTypes = [...new Set(typeCandidates)];
  let lastError: string | null = null;

  for (const otpType of uniqueTypes) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: otpType,
    });

    if (!error) {
      const destination =
        otpType === "recovery" || otpType === "invite" || otpType === "signup"
          ? "/update-password"
          : next.startsWith("/")
            ? next
            : "/update-password";

      return NextResponse.redirect(`${origin}${destination}`);
    }

    lastError = error.message;
  }

  return NextResponse.redirect(
    `${origin}/sign-in?error=recovery-failed&reason=${encodeURIComponent(lastError ?? "unknown")}`,
  );
}
