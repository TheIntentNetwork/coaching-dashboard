"use client";

import Link from "next/link";
import { CalendarCheck2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

type SetupWaitingProps = {
  variant: "waiting" | "approved" | "scheduled";
  studentName?: string | null;
  meetingDateLabel?: string | null;
  meetingTypeLabel?: string | null;
  meetingTimeLabel?: string | null;
};

/** Shown after Set Schedule is completed (or historically approved). */
export function SetupWaiting({
  variant,
  studentName,
  meetingDateLabel,
  meetingTypeLabel,
  meetingTimeLabel,
}: SetupWaitingProps) {
  const isApproved = variant === "approved";
  const isScheduled = variant === "scheduled" || variant === "waiting";
  const name = studentName?.trim() || "there";

  const whenBits = [meetingDateLabel, meetingTimeLabel].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-lg text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          {isApproved ? <CheckCircle2 size={30} /> : <CalendarCheck2 size={30} />}
        </div>

        <h1 className="mb-4 font-headline text-3xl leading-tight text-on-background sm:text-4xl md:text-5xl">
          {isApproved ? "You’re all set" : "Thanks for scheduling"}
        </h1>

        <p className="mb-4 font-body text-lg text-on-surface">
          Welcome, {name}.
        </p>

        <p className="mb-8 font-body leading-relaxed text-on-surface-variant">
          {isScheduled
            ? [
                "We appreciate you locking in your next step.",
                whenBits
                  ? `Let’s meet${meetingTypeLabel ? ` for your ${meetingTypeLabel}` : ""} on ${whenBits}.`
                  : "Your meeting is on the calendar.",
                "You can start preparing anytime from your dashboard.",
              ].join(" ")
            : "Your dashboard is ready. Start preparation whenever you like."}
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-3.5 font-body text-base font-bold text-on-primary shadow-soft transition-all active:scale-95"
        >
          Go to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
