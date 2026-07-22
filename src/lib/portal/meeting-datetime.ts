/** Parse YYYY-MM-DD + optional "H:MM AM/PM" into a local Date. */
export function parseMeetingDateTime(
  date: string | null | undefined,
  time: string | null | undefined,
): Date | null {
  if (!date) return null;

  if (time?.trim()) {
    const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      let hour = Number(match[1]);
      const minute = Number(match[2]);
      const meridiem = match[3].toUpperCase();
      if (meridiem === "PM" && hour < 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;

      const [y, m, d] = date.split("-").map(Number);
      if (y && m && d) {
        const local = new Date(y, m - 1, d, hour, minute, 0, 0);
        if (!Number.isNaN(local.getTime())) return local;
      }
    }
  }

  const fallback = new Date(`${date}T12:00:00`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function resolveMeetingTarget(
  startsAt: string | null | undefined,
  date: string | null | undefined,
  time: string | null | undefined,
): Date | null {
  if (startsAt) {
    const iso = new Date(startsAt);
    if (!Number.isNaN(iso.getTime())) return iso;
  }
  return parseMeetingDateTime(date, time);
}

export function formatMeetingCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}
