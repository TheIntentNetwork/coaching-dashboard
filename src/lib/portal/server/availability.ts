import { createAdminClient } from "@/lib/supabase/admin";

export type AvailableDay = {
  date: string; // YYYY-MM-DD
  times: string[]; // e.g. "10:30 AM"
};

type SlotRow = {
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date: string | null;
  is_active: boolean;
};

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseTimeToMinutes(t: string): number {
  // "09:00:00" or "09:00"
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToLabel(total: number): string {
  let h = Math.floor(total / 60);
  const m = total % 60;
  const meridiem = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${String(m).padStart(2, "0")} ${meridiem}`;
}

function expandWindow(startTime: string, endTime: string, stepMinutes = 30): string[] {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const out: string[] = [];
  for (let t = start; t + stepMinutes <= end; t += stepMinutes) {
    out.push(minutesToLabel(t));
  }
  return out.length > 0 ? out : [minutesToLabel(start)];
}

/**
 * Build bookable date/time options from advisor_availability_slots
 * for the next `daysAhead` days (excluding past times today).
 */
export async function getAdvocateAvailableDays(
  advisorId: string,
  daysAhead = 28,
): Promise<AvailableDay[]> {
  const admin = createAdminClient();
  const { data: slots } = await admin
    .from("advisor_availability_slots")
    .select("day_of_week, start_time, end_time, is_recurring, specific_date, is_active")
    .eq("advisor_id", advisorId)
    .eq("is_active", true);

  const rows = (slots || []) as SlotRow[];
  if (rows.length === 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const startYmd = toYmd(today);
  const end = new Date(today);
  end.setDate(end.getDate() + daysAhead);
  const endYmd = toYmd(end);

  const { data: appointments } = await admin
    .from("appointments")
    .select("start_time")
    .eq("advisor_id", advisorId)
    .gte("start_time", `${startYmd}T00:00:00`)
    .lte("start_time", `${endYmd}T23:59:59`)
    .neq("status", "cancelled");

  const booked = new Set(
    (appointments || []).map((a) => {
      const d = new Date(a.start_time);
      const ymd = toYmd(d);
      const label = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return `${ymd}|${label}`;
    }),
  );

  const byDate = new Map<string, Set<string>>();

  for (let offset = 0; offset < daysAhead; offset += 1) {
    const day = new Date(today);
    day.setDate(today.getDate() + offset);
    const ymd = toYmd(day);
    // JS getDay: 0=Sun … — match Postgres DOW if stored 0=Sun
    const dow = day.getDay();

    for (const slot of rows) {
      const matchesSpecific = slot.specific_date === ymd;
      const matchesRecurring =
        slot.is_recurring &&
        slot.day_of_week != null &&
        Number(slot.day_of_week) === dow;
      if (!matchesSpecific && !matchesRecurring) continue;

      const times = expandWindow(slot.start_time, slot.end_time);
      const set = byDate.get(ymd) || new Set<string>();
      for (const time of times) {
        if (offset === 0) {
          const mins = parseTimeToMinutes(
            (() => {
              const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
              if (!m) return "99:00";
              let h = Number(m[1]);
              const min = Number(m[2]);
              const mer = m[3].toUpperCase();
              if (mer === "PM" && h < 12) h += 12;
              if (mer === "AM" && h === 12) h = 0;
              return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
            })(),
          );
          if (mins <= nowMinutes) continue;
        }
        if (booked.has(`${ymd}|${time}`)) continue;
        set.add(time);
      }
      if (set.size > 0) byDate.set(ymd, set);
    }
  }

  return Array.from(byDate.entries())
    .map(([date, times]) => ({
      date,
      times: Array.from(times).sort((a, b) => parseTimeToMinutes(
        (() => {
          const m = a.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
          if (!m) return "00:00";
          let h = Number(m[1]);
          const min = Number(m[2]);
          const mer = m[3].toUpperCase();
          if (mer === "PM" && h < 12) h += 12;
          if (mer === "AM" && h === 12) h = 0;
          return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        })(),
      ) - parseTimeToMinutes(
        (() => {
          const m = b.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
          if (!m) return "00:00";
          let h = Number(m[1]);
          const min = Number(m[2]);
          const mer = m[3].toUpperCase();
          if (mer === "PM" && h < 12) h += 12;
          if (mer === "AM" && h === 12) h = 0;
          return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        })(),
      )),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
