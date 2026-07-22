"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

type AvailabilityMonthCalendarProps = {
  availableDates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  /** How many months ahead of today can be navigated (inclusive of current). */
  maxMonthsAhead?: number;
};

function toYmd(year: number, monthIndex: number, day: number) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  return `${year}-${month}-${dayStr}`;
}

export function AvailabilityMonthCalendar({
  availableDates,
  selectedDate,
  onSelectDate,
  maxMonthsAhead = 3,
}: AvailabilityMonthCalendarProps) {
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

  useEffect(() => {
    if (availableDates.length === 0) return;
    const [firstYear, firstMonth] = availableDates[0].split("-").map(Number);
    if (!firstYear || !firstMonth) return;
    setCurrentYear(firstYear);
    setCurrentMonth(firstMonth - 1);
  }, [availableDates]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const cells = useMemo(() => {
    const next: Array<{ day: number | null; dateString: string }> = [];
    for (let i = 0; i < firstDayOfWeek; i += 1) {
      next.push({ day: null, dateString: "" });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      next.push({
        day,
        dateString: toYmd(currentYear, currentMonth, day),
      });
    }
    return next;
  }, [currentMonth, currentYear, daysInMonth, firstDayOfWeek]);

  const isPrevDisabled = (() => {
    const today = new Date();
    return (
      currentYear < today.getFullYear() ||
      (currentYear === today.getFullYear() && currentMonth <= today.getMonth())
    );
  })();

  const isNextDisabled = (() => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear(), today.getMonth() + maxMonthsAhead, 1);
    return (
      currentYear > maxDate.getFullYear() ||
      (currentYear === maxDate.getFullYear() && currentMonth >= maxDate.getMonth())
    );
  })();

  function handlePrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
      return;
    }
    setCurrentMonth((m) => m - 1);
  }

  function handleNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
      return;
    }
    setCurrentMonth((m) => m + 1);
  }

  return (
    <div className="w-full select-none">
      <div className="mb-4 flex items-center justify-between px-1">
        <h4 className="flex items-center gap-2 text-sm font-bold text-on-surface">
          <Calendar className="h-4 w-4 text-primary" />
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h4>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isPrevDisabled}
            aria-label="Previous month"
            className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-1.5 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={isNextDisabled}
            aria-label="Next month"
            className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-1.5 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="py-1 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant"
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        <AnimatePresence mode="popLayout">
          {cells.map((cell, idx) => {
            if (!cell.day) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const isAvailable = availableSet.has(cell.dateString);
            const isSelected = selectedDate === cell.dateString;

            return (
              <motion.button
                key={cell.dateString}
                type="button"
                whileTap={isAvailable ? { scale: 0.95 } : undefined}
                disabled={!isAvailable}
                onClick={() => onSelectDate(cell.dateString)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border text-xs font-bold outline-none transition-all ${
                  isSelected
                    ? "border-transparent bg-primary text-on-primary shadow-md"
                    : isAvailable
                      ? "border-transparent bg-surface-container-lowest text-on-surface shadow-sm hover:border-primary/40"
                      : "pointer-events-none cursor-not-allowed border-transparent bg-surface-variant/40 text-outline opacity-50"
                }`}
              >
                <span>{cell.day}</span>
                {isAvailable && !isSelected ? (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                ) : null}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
