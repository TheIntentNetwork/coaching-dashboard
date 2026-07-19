"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  BOOKING_PURPOSES,
  BOOKING_TIMES,
  buildPaymentHref,
  buildSuccessHref,
} from "@/lib/booking";
import type { SessionBalance } from "@/lib/portal/session-grants";

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
  // Monday-first index: Sun=0 → 6
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
};

export function AdvocateBookingPanel({
  advocateName,
  hasAdvocate,
}: AdvocateBookingPanelProps) {
  const router = useRouter();
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toYmd(new Date()));
  const [time, setTime] = useState<string>(BOOKING_TIMES[1]);
  const [purpose, setPurpose] = useState<string>(BOOKING_PURPOSES[0]);
  const [balance, setBalance] = useState<SessionBalance | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [availableByDate, setAvailableByDate] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cells = useMemo(() => buildCalendarDays(month), [month]);
  const monthLabel = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const availableTimes = availableByDate[selectedDate] || [];
  const timeOptions = availableTimes.length > 0 ? availableTimes : BOOKING_TIMES;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingBalance(true);
      try {
        const [sessionsRes, availRes] = await Promise.all([
          fetch("/api/portal/sessions"),
          fetch("/api/portal/availability"),
        ]);
        const sessionsJson = await sessionsRes.json();
        const availJson = await availRes.json();
        if (cancelled) return;
        setBalance(sessionsJson.balance ?? null);
        const map: Record<string, string[]> = {};
        for (const day of availJson.days || []) {
          map[day.date] = day.times || [];
        }
        setAvailableByDate(map);
      } catch {
        if (!cancelled) setBalance(null);
      } finally {
        if (!cancelled) setLoadingBalance(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (availableTimes.length > 0 && !availableTimes.includes(time)) {
      setTime(availableTimes[0]);
    }
  }, [selectedDate, availableTimes, time]);

  async function onConfirmBook() {
    if (!hasAdvocate) {
      setError("You need an assigned advocate before booking.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, time, purpose }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not book this meeting.");
        return;
      }

      if (json.mode === "booked") {
        if (json.balance) setBalance(json.balance);
        router.push(
          buildSuccessHref({
            date: selectedDate,
            time,
            purpose,
            appointmentId: json.appointmentId,
            advocateName: json.advocateName || advocateName,
          }),
        );
        return;
      }

      if (json.mode === "payment_required") {
        if (json.balance) setBalance(json.balance);
        router.push(
          buildPaymentHref({
            intentId: json.intentId,
            date: selectedDate,
            time,
            purpose,
          }),
        );
      }
    } catch {
      setError("Could not book this meeting.");
    } finally {
      setSubmitting(false);
    }
  }

  const remaining = balance?.sessionsRemaining ?? 0;
  const total = balance?.sessionsIncluded ?? 0;

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
          {loadingBalance
            ? "Loading sessions…"
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

      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-bold text-on-surface">{monthLabel}</span>
          <div className="flex space-x-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
              className="rounded-full p-1 hover:bg-surface-variant"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
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
            const selectable =
              cell.inMonth &&
              !isPast &&
              (Object.keys(availableByDate).length === 0 || hasSlots);
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

      <div className="mb-5 space-y-4">
        <div>
          <label
            htmlFor="meeting-time"
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
          >
            Time
          </label>
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
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      {balance && remaining === 0 ? (
        <p className="mb-4 text-sm text-on-surface-variant">
          No sessions left. Confirming will take you to Stripe to purchase an extra session (
          {balance.extraSessionPriceLabel}).
        </p>
      ) : null}

      <button
        type="button"
        disabled={submitting || !hasAdvocate || loadingBalance}
        onClick={() => void onConfirmBook()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-on-primary shadow-soft transition-all hover:bg-primary-container hover:text-on-primary-container disabled:opacity-60"
      >
        {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
        {balance && remaining === 0 ? "Continue to payment" : "Confirm Schedule"}
      </button>
    </div>
  );
}
