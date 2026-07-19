"use client";

import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";
import { motion } from "framer-motion";

type SetupWaitingProps = {
  variant: "waiting" | "approved";
  studentName?: string | null;
  stepLabel?: string;
};

/** Shown across the setup wizard once a student's setup has been submitted or approved. */
export function SetupWaiting({ variant, studentName, stepLabel }: SetupWaitingProps) {
  const isApproved = variant === "approved";
  const possessive = studentName ? `${studentName}'s` : "Your";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-lg text-center"
      >
        <div
          className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
            isApproved ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary"
          }`}
        >
          {isApproved ? <CheckCircle2 size={30} /> : <Clock3 size={30} />}
        </div>

        {stepLabel ? (
          <span className="mb-2 block font-body text-sm font-semibold uppercase tracking-widest text-primary">
            {stepLabel}
          </span>
        ) : null}

        <h1 className="mb-4 font-headline text-3xl leading-tight text-on-background sm:text-4xl md:text-5xl">
          {isApproved ? "Setup Approved" : "Waiting for Your Advocate"}
        </h1>

        <p className="mb-8 font-body leading-relaxed text-on-surface-variant">
          {isApproved
            ? `${possessive} enrollment has been approved. Your dashboard is ready to go.`
            : `${possessive} setup has been submitted and is currently under review by your advocate. We'll let you know as soon as it's confirmed.`}
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
