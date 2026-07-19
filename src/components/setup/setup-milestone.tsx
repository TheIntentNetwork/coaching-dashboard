"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Calendar, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { CoverImage } from "@/components/ui/cover-image";
import { usePortalSetup } from "@/lib/portal/client/use-portal-setup";
import { SetupWaiting } from "@/components/setup/setup-waiting";
import { MEETING_TYPES, getMeetingType } from "@/lib/portal/meeting-types";
import { IMAGES } from "@/lib/images";

type AvailableDay = { date: string; times: string[] };

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

export function SetupMilestone() {
  const router = useRouter();
  const { setup, loading, setSetup } = usePortalSetup();
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingType, setMeetingType] = useState("");
  const [days, setDays] = useState<AvailableDay[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && !initialized) {
    setInitialized(true);
    setMeetingDate(setup?.meeting_date || "");
    setMeetingTime(setup?.meeting_time || "");
    setMeetingType(setup?.meeting_type || "");
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch("/api/portal/availability");
        const json = await res.json();
        if (!cancelled) setDays(json.days || []);
      } catch {
        if (!cancelled) setDays([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const timesForDate = useMemo(() => {
    const day = days.find((d) => d.date === meetingDate);
    return day?.times || [];
  }, [days, meetingDate]);

  useEffect(() => {
    if (timesForDate.length === 0) {
      if (meetingTime) setMeetingTime("");
      return;
    }
    if (!timesForDate.includes(meetingTime)) {
      setMeetingTime(timesForDate[0]);
    }
  }, [timesForDate, meetingTime]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!meetingDate || !meetingTime || !meetingType) {
      setError("Please choose an available date, time, and meeting type.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/setup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_date: meetingDate,
          meeting_time: meetingTime,
          meeting_type: meetingType,
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

  if (
    setup?.status === "submitted" ||
    setup?.status === "under_review" ||
    setup?.status === "approved"
  ) {
    const mt = getMeetingType(setup.meeting_type);
    return (
      <SetupWaiting
        variant="scheduled"
        studentName={setup.student_name}
        meetingDateLabel={formatMeetingDate(setup.meeting_date)}
        meetingTimeLabel={setup.meeting_time}
        meetingTypeLabel={mt?.label || setup.meeting_type}
      />
    );
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
                Set Schedule
              </span>
              <span className="h-px w-8 bg-outline-variant" />
              <span className="font-body text-sm text-on-surface-variant">Step 2 of 3</span>
            </div>
            <h1 className="mb-3 font-headline text-3xl leading-tight text-on-background sm:text-4xl lg:text-5xl">
              The Next Milestone
            </h1>
            <p className="max-w-md font-body leading-relaxed text-on-surface-variant">
              Choose a time that matches your advocate&apos;s availability so we can plan your
              preparation around a real slot.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="meeting-date" className="mb-3 block font-headline text-xl text-on-background">
                Available date
              </label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Loader2 size={16} className="animate-spin" />
                  Loading advocate availability…
                </div>
              ) : days.length === 0 ? (
                <p className="text-sm text-tertiary">
                  No open slots from your advocate yet. Please check back soon, or message them
                  from Messages.
                </p>
              ) : (
                <select
                  id="meeting-date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full appearance-none border-b-2 border-outline-variant/60 bg-transparent pb-2 font-body text-lg text-on-surface outline-none focus:border-primary"
                  required
                >
                  <option value="">Select a date</option>
                  {days.map((d) => (
                    <option key={d.date} value={d.date}>
                      {formatMeetingDate(d.date)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="meeting-time" className="mb-3 block font-headline text-xl text-on-background">
                Available time
              </label>
              <select
                id="meeting-time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                disabled={!meetingDate || timesForDate.length === 0}
                className="w-full appearance-none border-b-2 border-outline-variant/60 bg-transparent pb-2 font-body text-lg text-on-surface outline-none focus:border-primary disabled:opacity-50"
                required
              >
                <option value="">Select a time</option>
                {timesForDate.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
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
                required
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
                disabled={saving || loadingSlots || days.length === 0}
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
