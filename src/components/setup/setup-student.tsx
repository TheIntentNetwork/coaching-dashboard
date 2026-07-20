"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { CoverImage } from "@/components/ui/cover-image";
import { useAppSession } from "@/components/auth/session-provider";
import { usePortalSetup } from "@/lib/portal/client/use-portal-setup";
import { SetupWaiting } from "@/components/setup/setup-waiting";
import { getMeetingType } from "@/lib/portal/meeting-types";
import { IMAGES } from "@/lib/images";
import { useSetupMutation } from "@/lib/portal/query/hooks/use-setup";

function formatMeetingDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function SetupStudent() {
  const router = useRouter();
  const { displayName } = useAppSession();
  const { setup, loading, error: loadError, setSetup } = usePortalSetup();
  const setupMutation = useSetupMutation();
  const [error, setError] = useState<string | null>(null);

  const welcomeName = setup?.student_name || displayName || "there";
  const saving = setupMutation.isPending;

  async function handleContinue(e: FormEvent) {
    e.preventDefault();
    const name = welcomeName.trim();
    if (!name) {
      setError("Please update your name in Settings before continuing.");
      return;
    }
    setError(null);
    try {
      const json = await setupMutation.mutateAsync({ student_name: name });
      setSetup(json.setup);
      router.push("/setup/milestone");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-on-surface-variant">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  if (
    setup?.status === "submitted" ||
    setup?.status === "under_review" ||
    setup?.status === "approved"
  ) {
    const mt = getMeetingType(setup.meeting_type);
    return (
      <SetupWaiting
        variant={setup.status === "approved" ? "scheduled" : "scheduled"}
        studentName={setup.student_name}
        meetingDateLabel={formatMeetingDate(setup.meeting_date)}
        meetingTimeLabel={setup.meeting_time}
        meetingTypeLabel={mt?.label || setup.meeting_type}
      />
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 sm:py-10 md:px-12 md:py-14">
      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="order-2 max-w-lg lg:order-1"
        >
          <div className="mb-6 sm:mb-8">
            <h1 className="page-title text-on-background">
              Welcome,{" "}
              <span className="whitespace-nowrap">{welcomeName}</span>
            </h1>
            <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-variant sm:text-base">
              Let&apos;s set your schedule for the IEP journey. We&apos;ll use your name throughout
              — you can update it anytime in Settings.
            </p>
          </div>

          {setup?.status === "needs_changes" && setup.review_note ? (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3">
              <AlertCircle className="mt-0.5 shrink-0 text-tertiary" size={18} />
              <div>
                <p className="text-sm font-semibold text-tertiary">
                  Changes requested by your advocate
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">{setup.review_note}</p>
              </div>
            </div>
          ) : null}

          <form className="space-y-8" onSubmit={handleContinue}>
            {error ? <p className="text-sm text-tertiary">{error}</p> : null}
            {loadError ? <p className="text-sm text-tertiary">{loadError}</p> : null}

            <div className="flex items-center gap-6 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="group flex items-center gap-3 rounded-lg bg-primary px-10 py-4 font-body text-base font-bold text-on-primary shadow-soft transition-all active:scale-95 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <div className="order-1 hidden justify-center sm:flex lg:order-2 lg:justify-end">
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl shadow-soft">
            <CoverImage src={IMAGES.setupStudent} alt="Parent and child — advocacy journey" priority />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
            <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-outline-variant/20 bg-surface/85 p-4 backdrop-blur-md">
              <p className="mb-1 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Your Organizer
              </p>
              <p className="font-headline text-lg leading-tight text-on-surface">
                A calm home for your child&apos;s educational history.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
