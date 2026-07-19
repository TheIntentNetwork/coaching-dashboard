"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAppSession } from "@/components/auth/session-provider";
import { formatBookingDateLabel, parseBookingParams } from "@/lib/booking";

const REDIRECT_SECONDS = 5;

export function AdvocateSuccessScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { copy } = useAppSession();
  const booking = parseBookingParams(searchParams);
  const sessionId = searchParams.get("session_id");
  const intentId = searchParams.get("intent_id");
  const appointmentId = searchParams.get("appointment_id");

  const [seconds, setSeconds] = useState(REDIRECT_SECONDS);
  const [confirming, setConfirming] = useState(Boolean(sessionId || intentId));
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState({
    dateLabel: booking.date
      ? formatBookingDateLabel(booking.date)
      : searchParams.get("date")
        ? formatBookingDateLabel(searchParams.get("date")!)
        : "",
    time: booking.time,
    purpose: booking.purpose,
    advocateName: searchParams.get("advocate") || "",
  });

  useEffect(() => {
    if (!sessionId && !intentId) {
      setConfirming(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/portal/bookings/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, intentId }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || "Could not confirm payment booking.");
          setConfirming(false);
          return;
        }
        setDetails({
          dateLabel: formatBookingDateLabel(json.startTime || booking.date),
          time: booking.time || new Date(json.startTime).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
          purpose: json.purpose || booking.purpose,
          advocateName: json.advocateName || searchParams.get("advocate") || "",
        });
        setConfirming(false);
      } catch {
        if (!cancelled) {
          setError("Could not confirm payment booking.");
          setConfirming(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, intentId, booking.date, booking.time, booking.purpose, searchParams]);

  useEffect(() => {
    if (confirming || error) return;
    const tick = window.setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(tick);
  }, [confirming, error]);

  useEffect(() => {
    if (confirming || error || seconds > 0) return;
    router.replace("/advocate");
  }, [seconds, router, confirming, error]);

  if (confirming) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-on-surface-variant">
        <Loader2 className="animate-spin" size={22} />
        Confirming your payment and booking…
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center sm:px-8 sm:py-16"
    >
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary">
        <CheckCircle2 size={32} />
      </div>
      <h1 className="mb-3 font-headline text-4xl text-on-surface sm:text-5xl">
        {error ? "Booking issue" : "Meeting booked"}
      </h1>
      {error ? (
        <p className="mb-10 text-on-surface-variant">{error}</p>
      ) : (
        <>
          <p className="mb-2 font-body text-lg text-on-surface-variant">
            {details.dateLabel}
            {details.time ? ` at ${details.time}` : ""}
          </p>
          <p className="mb-10 text-on-surface-variant">
            {details.purpose}
            {details.advocateName ? ` with ${details.advocateName}` : ""}
            {appointmentId ? "" : ""}
          </p>
        </>
      )}

      {!error ? (
        <p className="mb-6 text-sm text-on-surface-variant">
          Returning to {copy.coachNavLabel} in{" "}
          <span className="font-bold text-primary">{seconds}</span>…
        </p>
      ) : null}

      <Link
        href="/advocate"
        className="rounded-xl bg-primary px-8 py-4 font-bold text-on-primary shadow-soft"
      >
        Back to {copy.coachNavLabel}
      </Link>
    </motion.div>
  );
}
