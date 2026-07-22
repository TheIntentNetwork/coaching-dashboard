"use client";

import { useMemo } from "react";
import { Clock, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AvailabilityMonthCalendar } from "@/components/booking/availability-month-calendar";
import type { AvailabilityDay } from "@/lib/portal/query/hooks/use-advocate";

type AvailabilityDateTimePickerProps = {
  days: AvailabilityDay[];
  selectedDate: string;
  selectedTime: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  timezoneLabel?: string;
  /** split = calendar | times side-by-side from lg; stack = always stacked */
  layout?: "split" | "stack";
};

function isMorningTime(label: string) {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return true;
  let hour = Number(match[1]);
  const period = match[3].toUpperCase();
  if (period === "AM") {
    if (hour === 12) hour = 0;
  } else if (hour !== 12) {
    hour += 12;
  }
  return hour < 12;
}

function TimeSlotGroup({
  label,
  times,
  selectedTime,
  onSelect,
}: {
  label: string;
  times: string[];
  selectedTime: string;
  onSelect: (time: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {times.map((time) => {
          const selected = selectedTime === time;
          return (
            <button
              key={time}
              type="button"
              onClick={() => onSelect(time)}
              className={`rounded-xl border px-1 py-2 text-xs font-bold outline-none transition-all ${
                selected
                  ? "border-transparent bg-primary text-on-primary shadow-sm"
                  : "border-outline-variant/50 bg-surface-container-lowest text-on-surface hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AvailabilityDateTimePicker({
  days,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  loading = false,
  emptyMessage = "No open slots from your advocate yet. Please check back soon.",
  timezoneLabel,
  layout = "split",
}: AvailabilityDateTimePickerProps) {
  const availableDates = useMemo(
    () => days.filter((d) => d.times.length > 0).map((d) => d.date),
    [days],
  );

  const timesForDate = useMemo(() => {
    const day = days.find((d) => d.date === selectedDate);
    return day?.times || [];
  }, [days, selectedDate]);

  const morningTimes = timesForDate.filter(isMorningTime);
  const afternoonTimes = timesForDate.filter((t) => !isMorningTime(t));

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-outline-variant/40 bg-surface-container-low px-4 py-16 text-on-surface-variant">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Loading available times…</span>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-low px-4 py-12 text-center">
        <Clock className="mx-auto mb-3 h-8 w-8 text-on-surface-variant" />
        <p className="text-sm font-semibold text-on-surface">Not available at the moment</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-on-surface-variant">{emptyMessage}</p>
      </div>
    );
  }

  const split = layout === "split";

  return (
    <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-low p-4 shadow-soft sm:p-5">
      <div
        className={`grid grid-cols-1 items-start gap-6 ${
          split ? "lg:grid-cols-12 lg:gap-8" : ""
        }`}
      >
        <div className={split ? "lg:col-span-7" : ""}>
          <AvailabilityMonthCalendar
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              onSelectDate(date);
              onSelectTime("");
            }}
          />
        </div>

        <div
          className={`min-h-[220px] border-t border-outline-variant/40 pt-6 ${
            split
              ? "lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
              : ""
          }`}
        >
          <AnimatePresence mode="wait">
            {!selectedDate ? (
              <motion.div
                key="time-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[220px] flex-col items-center justify-center space-y-2.5 rounded-2xl border border-dashed border-outline-variant/50 bg-surface-variant/30 p-4 text-center text-on-surface-variant"
              >
                <Clock className="h-7 w-7 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Select a Date</p>
                <p className="max-w-[160px] text-[11px] font-semibold leading-relaxed">
                  Choose a day on the calendar to view available times.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="time-slots"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-baseline justify-between border-b border-outline-variant/40 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                    Available Times
                  </h4>
                  {timezoneLabel ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                      {timezoneLabel}
                    </span>
                  ) : null}
                </div>

                <div className="max-h-[300px] space-y-4 overflow-y-auto pr-1">
                  {morningTimes.length > 0 ? (
                    <TimeSlotGroup
                      label="Morning"
                      times={morningTimes}
                      selectedTime={selectedTime}
                      onSelect={onSelectTime}
                    />
                  ) : null}
                  {afternoonTimes.length > 0 ? (
                    <TimeSlotGroup
                      label="Afternoon"
                      times={afternoonTimes}
                      selectedTime={selectedTime}
                      onSelect={onSelectTime}
                    />
                  ) : null}
                  {timesForDate.length === 0 ? (
                    <p className="py-10 text-center text-xs font-medium text-on-surface-variant">
                      No available sessions on this day.
                    </p>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
