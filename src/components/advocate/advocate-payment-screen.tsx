"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { useAppSession } from "@/components/auth/session-provider";
import { formatBookingDateLabel, parseBookingParams } from "@/lib/booking";
import {
  useAdvocateQuery,
  useSessionsQuery,
} from "@/lib/portal/query/hooks/use-advocate";
import { apiSend } from "@/lib/portal/query/fetcher";

export function AdvocatePaymentScreen() {
  const searchParams = useSearchParams();
  const { copy } = useAppSession();
  const booking = parseBookingParams(searchParams);
  const intentId = searchParams.get("intent_id") || booking.intentId || "";

  const sessionsQuery = useSessionsQuery();
  const advocateQuery = useAdvocateQuery();
  const amountLabel =
    sessionsQuery.data?.balance?.extraSessionPriceLabel || "$197";
  const advocateName = advocateQuery.data?.advocate?.name || null;
  const startLabel = booking.date
    ? formatBookingDateLabel(booking.date)
    : "Selected date";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutAmountLabel, setCheckoutAmountLabel] = useState<string | null>(
    null,
  );
  const displayAmount = checkoutAmountLabel || amountLabel;

  async function payWithStripe() {
    if (!intentId) {
      setError("Missing booking intent. Go back and confirm your schedule again.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const json = await apiSend<{
        amountLabel?: string;
        checkoutUrl?: string;
      }>("/api/portal/bookings/checkout", {
        method: "POST",
        json: {
          intentId,
          returnTo:
            booking.returnTo || searchParams.get("return_to") || "/advocate",
        },
      });
      if (json.amountLabel) setCheckoutAmountLabel(json.amountLabel);
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
        return;
      }
      setError("Stripe did not return a checkout URL.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not start Stripe Checkout.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="page-pad mx-auto max-w-4xl"
    >
      <Link
        href="/advocate"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary sm:mb-8"
      >
        <ArrowLeft size={16} />
        Back to {copy.coachNavLabel}
      </Link>

      <h1 className="page-title mb-6 sm:mb-10">Payment</h1>

      <div className="grid gap-6 sm:gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-soft sm:p-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-primary">
            Order summary
          </p>
          <ul className="mb-8 space-y-3 font-body text-on-surface-variant">
            <li>
              <span className="text-on-surface">Date:</span> {startLabel}
            </li>
            <li>
              <span className="text-on-surface">Time:</span> {booking.time}
            </li>
            <li>
              <span className="text-on-surface">Purpose:</span> {booking.purpose}
            </li>
            <li>
              <span className="text-on-surface">{copy.coachNoun}:</span>{" "}
              {advocateName || "Your assigned advocate"}
            </li>
            <li>
              <span className="text-on-surface">Item:</span> Extra session
            </li>
          </ul>
          <div className="flex items-baseline justify-between border-t border-outline-variant/40 pt-5">
            <span className="text-lg font-bold text-on-surface">Total</span>
            <span className="font-headline text-4xl text-primary">{displayAmount}</span>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5 shadow-soft sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Secure checkout
          </p>
          <p className="font-body text-sm leading-relaxed text-on-surface-variant">
            You&apos;ll complete payment on Stripe&apos;s secure page. After payment succeeds, your
            meeting is booked and one session is added to your package.
          </p>
          <p className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Lock size={14} className="text-primary" />
            Card details are handled by Stripe. We never store your full card number.
          </p>
          {error ? (
            <p className="rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy || !intentId}
            onClick={() => void payWithStripe()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-on-primary shadow-soft transition-all hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : null}
            Pay {displayAmount} with Stripe
          </button>
        </div>
      </div>
    </motion.div>
  );
}
