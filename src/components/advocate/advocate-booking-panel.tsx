"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AvailabilityDateTimePicker } from "@/components/booking/availability-datetime-picker";
import { ScheduledMeetingNotice } from "@/components/booking/scheduled-meeting-notice";
import {
  BOOKING_PURPOSES,
  buildPaymentHref,
  buildSuccessHref,
  sanitizeReturnTo,
} from "@/lib/booking";
import { useUpcomingScheduledMeeting } from "@/lib/portal/client/use-upcoming-scheduled-meeting";
import type { SessionBalance } from "@/lib/portal/session-grants";
import {
  useAvailabilityQuery,
  useBookingMutation,
  useSessionsQuery,
} from "@/lib/portal/query/hooks/use-advocate";

type AdvocateBookingPanelProps = {
  advocateName?: string | null;
  hasAdvocate: boolean;
  /** stack = My Advocate column; split = Meetings page two-column layout */
  layout?: "stack" | "split";
  /** Where success/payment should return (e.g. /meetings) */
  returnTo?: string;
};

export function AdvocateBookingPanel({
  advocateName,
  hasAdvocate,
  layout = "stack",
  returnTo = "/advocate",
}: AdvocateBookingPanelProps) {
  const router = useRouter();
  const safeReturnTo = sanitizeReturnTo(returnTo);

  const [selectedDate, setSelectedDate] = useState("");
  const [time, setTime] = useState("");
  const [purpose, setPurpose] = useState<string>(BOOKING_PURPOSES[0]);
  const [attendRemotely, setAttendRemotely] = useState(true);
  const [customPurpose, setCustomPurpose] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [initializedSlots, setInitializedSlots] = useState(false);
  const [proceedWithExistingMeeting, setProceedWithExistingMeeting] = useState(false);

  const upcomingMeeting = useUpcomingScheduledMeeting();

  const sessionsQuery = useSessionsQuery();
  const availabilityQuery = useAvailabilityQuery();
  const bookingMutation = useBookingMutation();

  const balance = (sessionsQuery.data?.balance ?? null) as SessionBalance | null;
  const days = availabilityQuery.data?.days || [];

  const loadingSlots =
    (sessionsQuery.isPending && !sessionsQuery.data) ||
    (availabilityQuery.isPending && !availabilityQuery.data);
  const submitting = bookingMutation.isPending;

  const isOther = purpose === "Other";
  const resolvedPurpose = isOther ? customPurpose.trim() : purpose;
  const canBook =
    !loadingSlots &&
    hasAdvocate &&
    Boolean(selectedDate) &&
    Boolean(time) &&
    days.length > 0 &&
    (!upcomingMeeting || proceedWithExistingMeeting);

  useEffect(() => {
    setProceedWithExistingMeeting(false);
  }, [upcomingMeeting?.startsAt.getTime(), upcomingMeeting?.title]);

  useEffect(() => {
    if (initializedSlots || loadingSlots) return;
    const firstDay = days.find((d) => d.times.length > 0);
    if (firstDay) {
      setSelectedDate(firstDay.date);
      setTime(firstDay.times[0] || "");
    } else {
      setSelectedDate("");
      setTime("");
    }
    setInitializedSlots(true);
  }, [days, initializedSlots, loadingSlots]);

  useEffect(() => {
    if (loadingSlots || !selectedDate) return;
    const day = days.find((d) => d.date === selectedDate);
    const availableTimes = day?.times || [];
    if (availableTimes.length === 0) {
      if (time) setTime("");
      return;
    }
    if (time && !availableTimes.includes(time)) {
      setTime("");
    }
  }, [days, loadingSlots, selectedDate, time]);

  async function onConfirmBook() {
    if (!hasAdvocate) {
      setError("You need an assigned advocate before booking.");
      return;
    }
    if (loadingSlots || !time || !selectedDate) {
      setError("Please wait for available times to load, then choose a slot.");
      return;
    }
    if (!resolvedPurpose) {
      setError("Please enter a purpose / reason for this meeting.");
      return;
    }
    setError(null);
    try {
      const json = await bookingMutation.mutateAsync({
        date: selectedDate,
        time,
        purpose: resolvedPurpose,
        attendRemotely,
      });

      if (json.mode === "booked") {
        router.push(
          buildSuccessHref({
            date: selectedDate,
            time,
            purpose: resolvedPurpose,
            appointmentId: json.appointmentId,
            advocateName: json.advocateName || advocateName,
            returnTo: safeReturnTo,
          }),
        );
        return;
      }

      if (json.mode === "payment_required" && json.intentId) {
        router.push(
          buildPaymentHref({
            intentId: json.intentId,
            date: selectedDate,
            time,
            purpose: resolvedPurpose,
            returnTo: safeReturnTo,
          }),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not book this meeting.");
    }
  }

  const remaining = balance?.sessionsRemaining ?? 0;
  const total = balance?.sessionsIncluded ?? 0;

  const detailsBlock = (
    <div className={layout === "split" ? "flex h-full flex-col" : ""}>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="meeting-purpose"
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
          >
            Purpose / reason
          </label>
          <select
            id="meeting-purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary"
          >
            {BOOKING_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        {isOther ? (
          <div>
            <label
              htmlFor="meeting-purpose-other"
              className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
            >
              Describe the reason
            </label>
            <textarea
              id="meeting-purpose-other"
              value={customPurpose}
              onChange={(e) => setCustomPurpose(e.target.value)}
              placeholder="What would you like to discuss?"
              rows={3}
              className="w-full resize-y rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
        ) : null}
        <label className="flex items-start gap-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={attendRemotely}
            onChange={(e) => setAttendRemotely(e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="block font-bold text-on-surface">Attend via secure video (remote)</span>
            <span className="mt-1 block text-xs text-on-surface-variant">
              Best for out-of-state families. Recording may be available after the session.
            </span>
          </span>
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      {balance && remaining === 0 ? (
        <p className="mt-4 text-sm text-on-surface-variant">
          No sessions left. Confirming will take you to Stripe to purchase an extra session (
          {balance.extraSessionPriceLabel}).
        </p>
      ) : null}

      <button
        type="button"
        disabled={submitting || !canBook}
        onClick={() => void onConfirmBook()}
        className={`flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-on-primary shadow-soft transition-all hover:bg-primary-container hover:text-on-primary-container disabled:opacity-60 ${
          layout === "split" ? "mt-auto pt-6" : "mt-5"
        }`}
      >
        {submitting || loadingSlots ? <Loader2 size={18} className="animate-spin" /> : null}
        {loadingSlots
          ? "Loading times…"
          : balance && remaining === 0
            ? "Continue to payment"
            : "Book a Meeting"}
      </button>
    </div>
  );

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5 shadow-soft sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h2 className="font-headline text-2xl text-on-surface sm:text-3xl">Book a Meeting</h2>
          {advocateName ? (
            <p className="mt-1 text-sm text-on-surface-variant">with {advocateName}</p>
          ) : null}
        </div>
        <p className="shrink-0 self-start rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
          {loadingSlots
            ? "Loading availability…"
            : balance
              ? `${remaining} of ${total} sessions left`
              : "No package yet"}
        </p>
      </div>

      {!hasAdvocate ? (
        <p className="mb-4 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          Booking unlocks after your advisor enrolls you and assigns an advocate.
        </p>
      ) : null}

      {upcomingMeeting ? (
        <div className="mb-6">
          <ScheduledMeetingNotice
            meeting={upcomingMeeting}
            requireProceedAck
            proceedAcknowledged={proceedWithExistingMeeting}
            onProceedAckChange={setProceedWithExistingMeeting}
          />
        </div>
      ) : null}

      <div className="mb-6">
        <AvailabilityDateTimePicker
          days={days}
          selectedDate={selectedDate}
          selectedTime={time}
          onSelectDate={setSelectedDate}
          onSelectTime={setTime}
          loading={loadingSlots}
          layout={layout === "split" ? "split" : "stack"}
        />
      </div>

      {detailsBlock}
    </div>
  );
}
