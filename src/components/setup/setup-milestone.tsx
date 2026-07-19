"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Calendar, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { CoverImage } from "@/components/ui/cover-image";
import { usePortalSetup } from "@/lib/portal/client/use-portal-setup";
import { SetupWaiting } from "@/components/setup/setup-waiting";
import { MEETING_TYPES } from "@/lib/portal/meeting-types";
import { IMAGES } from "@/lib/images";

export function SetupMilestone() {
  const router = useRouter();
  const { setup, loading, setSetup } = usePortalSetup();
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingType, setMeetingType] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && !initialized) {
    setInitialized(true);
    setMeetingDate(setup?.meeting_date || "");
    setMeetingType(setup?.meeting_type || "");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/setup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_date: meetingDate || null,
          meeting_type: meetingType || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setSetup(json.setup);
      router.push("/setup/documentation");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-on-surface-variant">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  if (setup?.status === "submitted" || setup?.status === "under_review") {
    return <SetupWaiting variant="waiting" studentName={setup.student_name} />;
  }

  if (setup?.status === "approved") {
    return <SetupWaiting variant="approved" studentName={setup.student_name} />;
  }

  const selectedMeetingType = MEETING_TYPES.find((mt) => mt.id === meetingType) || null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 md:py-14">
      <div className="grid w-full max-w-5xl items-center gap-8 md:grid-cols-2 lg:gap-16">
        <div className="relative order-2 hidden md:order-1 md:block">
          <div className="relative aspect-square overflow-hidden rounded-2xl border-4 border-white/50 shadow-soft">
            <CoverImage src={IMAGES.setupMilestone} alt="IEP planning and education materials" />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/25 to-transparent" />
          </div>
          {selectedMeetingType ? (
            <div className="absolute -bottom-4 -right-2 hidden rounded-xl border border-outline-variant/20 bg-white p-4 shadow-soft lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed">
                  <Calendar className="text-primary" size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Priority
                  </p>
                  <p className="font-headline text-sm font-semibold">{selectedMeetingType.shortTitle}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-1 flex flex-col md:order-2"
        >
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="font-body text-sm font-bold uppercase tracking-wider text-primary">
                Onboarding
              </span>
              <span className="h-px w-8 bg-outline-variant" />
              <span className="font-body text-sm text-on-surface-variant">Step 2 of 3</span>
            </div>
            <h1 className="mb-3 font-headline text-3xl leading-tight text-on-background sm:text-4xl lg:text-5xl">
              The Next Milestone
            </h1>
            <p className="max-w-md font-body leading-relaxed text-on-surface-variant">
              Effective advocacy begins with planning. Mark the calendar for your next meeting so we
              can start building your strategy today.
            </p>
          </div>

          <div className="mb-8 flex h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
            <div className="h-full w-1/3 bg-outline-variant" />
            <div className="h-full w-1/3 bg-primary" />
            <div className="h-full w-1/3 bg-surface-container" />
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="meeting-date" className="mb-3 block font-headline text-xl text-on-background">
                When is your next meeting?
              </label>
              <input
                id="meeting-date"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full border-b-2 border-outline-variant/60 bg-transparent pb-2 font-body text-lg text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="meeting-type" className="mb-3 block font-headline text-xl text-on-background">
                What type of meeting is it?
              </label>
              <select
                id="meeting-type"
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className="w-full appearance-none border-b-2 border-outline-variant/60 bg-transparent pb-2 font-body text-lg text-on-surface outline-none focus:border-primary"
              >
                <option value="">Select meeting type</option>
                {MEETING_TYPES.map((mt) => (
                  <option key={mt.id} value={mt.id}>
                    {mt.label}
                  </option>
                ))}
              </select>
            </div>

            {error ? <p className="text-sm text-tertiary">{error}</p> : null}

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => router.push("/setup")}
                className="flex items-center gap-2 px-4 py-2 font-body font-medium text-on-surface-variant hover:text-primary"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-3 rounded-lg bg-primary px-8 py-3.5 font-body text-base font-bold text-on-primary shadow-soft disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
