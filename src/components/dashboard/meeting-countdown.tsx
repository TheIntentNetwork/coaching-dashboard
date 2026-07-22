"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatMeetingCountdown,
  resolveMeetingTarget,
} from "@/lib/portal/meeting-datetime";

type MeetingCountdownProps = {
  date?: string | null;
  time?: string | null;
  startsAt?: string | null;
  className?: string;
};

export function MeetingCountdown({
  date,
  time,
  startsAt,
  className = "",
}: MeetingCountdownProps) {
  const target = useMemo(
    () => resolveMeetingTarget(startsAt, date, time),
    [startsAt, date, time],
  );
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;

    const tick = () => setRemainingMs(target.getTime() - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!target || remainingMs === null || remainingMs <= 0) return null;

  return (
    <span
      className={`mt-0.5 font-label text-xs font-bold tabular-nums tracking-wide text-primary ${className}`}
      aria-live="polite"
      aria-label={`Meeting starts in ${formatMeetingCountdown(remainingMs)}`}
    >
      {formatMeetingCountdown(remainingMs)}
    </span>
  );
}
