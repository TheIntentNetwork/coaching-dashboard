"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  BOOKING_PURPOSES,
  buildPaymentHref,
  buildSuccessHref,
  sanitizeReturnTo,
} from "@/lib/booking";
import type { SessionBalance } from "@/lib/portal/session-grants";
import {
  useAvailabilityQuery,
  useBookingMutation,
  useSessionsQuery,
} from "@/lib/portal/query/hooks/use-advocate";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildCalendarDays(month: Date) {
  const first = startOfMonth(month);
  const mondayIndex = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const prevMonthDays = new Date(month.getFullYear(), month.getMonth(), 0).getDate();

  const cells: Array<{ date: Date; ymd: string; muted: boolean; inMonth: boolean }> = [];

  for (let i = mondayIndex - 1; i >= 0; i -= 1) {
    const day = prevMonthDays - i;
    const date = new Date(month.getFullYear(), month.getMonth() - 1, day);
    cells.push({ date, ymd: toYmd(date), muted: true, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    cells.push({ date, ymd: toYmd(date), muted: false, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const day = cells.length - (mondayIndex + daysInMonth) + 1;
    const date = new Date(month.getFullYear(), month.getMonth() + 1, day);
    cells.push({ date, ymd: toYmd(date), muted: true, inMonth: false });
  }

  return cells;
}

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
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toYmd(new Date()));
  const [time, setTime] = useState<string>("");
  const [purpose, setPurpose] = useState<string>(BOOKING_PURPOSES[0]);
  const [attendRemotely, setAttendRemotely] = useState(true);
  const [customPurpose, setCustomPurpose] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [initializedSlots, setInitializedSlots] = useState(false);

  const sessionsQuery = useSessionsQuery();
  const availabilityQuery = useAvailabilityQuery();
  const bookingMutation = useBookingMutation();

  const balance = (sessionsQuery.data?.balance ?? null) as SessionBalance | null;
  const availableByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const day of availabilityQuery.data?.days || []) {
      if (day.date && Array.isArray(day.times) && day.times.length > 0) {
        map[day.date] = day.times;
      }
    }
    return map;
  }, [availabilityQuery.data?.days]);

  const loadingSlots =
    (sessionsQuery.isPending && !sessionsQuery.data) ||
    (availabilityQuery.isPending && !availabilityQuery.data);
  const submitting = bookingMutation.isPending;

  const cells = useMemo(() => buildCalendarDays(month), [month]);
  const monthLabel = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const availableTimes = availableByDate[selectedDate] || [];
  const timeOptions = availableTimes;
  const isOther = purpose === "Other";
  const resolvedPurpose = isOther ? customPurpose.trim() : purpose;
  const canBook =
    !loadingSlots && hasAdvocate && Boolean(selectedDate) && Boolean(time) && timeOptions.length > 0;

  useEffect(() => {
    if (initializedSlots || loadingSlots) return;
    const firstDate = Object.keys(availableByDate).sort()[0];
    if (firstDate) {
      const [y, m] = firstDate.split("-").map(Number);
      setMonth(startOfMonth(new Date(y, m - 1, 1)));
      setSelectedDate(firstDate);
      setTime(availableByDate[firstDate][0] || "");
    } else {
      setTime("");
    }
    setInitializedSlots(true);
  }, [availableByDate, initializedSlots, loadingSlots]);

  useEffect(() => {
    if (loadingSlots) return;
    if (availableTimes.length === 0) {
      if (time) setTime("");
      return;
    }
    if (!availableTimes.includes(time)) {
      setTime(availableTimes[0]);
    }
  }, [selectedDate, availableTimes, time, loadingSlots]);

  async function onConfirmBook() {
    if (!hasAdvocate) {
      setError("You need an assigned advocate before booking.");
      return;
    }
    if (loadingSlots || !time || timeOptions.length === 0) {
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

  const calendarBlock = (
    <div className={layout === "split" ? "" : "mb-6"}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-bold text-on-surface">{monthLabel}</span>
        <div className="flex space-x-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="rounded-full p-1 hover:bg-surface-variant"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="rounded-full p-1 hover:bg-surface-variant"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-bold text-outline sm:gap-2">
        {WEEKDAYS.map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm sm:gap-2">
        {cells.map((cell) => {
          const isPast = cell.date < today;
          const hasSlots = Boolean(availableByDate[cell.ymd]?.length);
            const selectable = !loadingSlots && cell.inMonth && !isPast && hasSlots;
          const selected = selectedDate === cell.ymd && selectable;
          const isToday = toYmd(today) === cell.ymd;
          return (
            <button
              key={cell.ymd}
              type="button"
              disabled={!selectable}
              onClick={() => setSelectedDate(cell.ymd)}
              className={`p-1.5 transition-colors sm:p-2 ${
                selected
                  ? "rounded-lg bg-primary font-bold text-on-primary shadow-soft"
                  : isToday && selectable
                    ? "rounded-lg bg-primary/10 font-bold text-primary"
                    : !selectable
                      ? "cursor-default text-outline/40"
                      : "rounded-lg hover:bg-surface-variant"
              }`}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );

  const detailsBlock = (
    <div className={layout === "split" ? "flex h-full flex-col" : ""}>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="meeting-time"
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
          >
            Time
          </label>
          {loadingSlots ? (
            <div className="flex items-center gap-2 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">
              <Loader2 size={16} className="animate-spin" />
              Loading available times…
            </div>
          ) : timeOptions.length === 0 ? (
            <div className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">
              No open times on this date. Pick another day.
            </div>
          ) : (
            <select
              id="meeting-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary"
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>
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
            <input
              id="meeting-purpose-other"
              type="text"
              value={customPurpose}
              onChange={(e) => setCustomPurpose(e.target.value)}
              placeholder="What would you like to discuss?"
              className="w-full rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary"
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

      {loadingSlots ? (
        <div className="flex min-h-[12rem] items-center justify-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest/60 py-16 text-on-surface-variant">
          <Loader2 className="animate-spin" size={20} />
          Loading available dates and times…
        </div>
      ) : layout === "split" ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <div>{calendarBlock}</div>
          <div>{detailsBlock}</div>
        </div>
      ) : (
        <>
          {calendarBlock}
          {detailsBlock}
        </>
      )}
    </div>
  );
}
