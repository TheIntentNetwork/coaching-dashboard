export const BOOKING_TIMES = [
  "9:00 AM",
  "10:30 AM",
  "1:00 PM",
  "2:30 PM",
  "4:00 PM",
] as const;

export const BOOKING_PURPOSES = [
  "IEP Draft Review",
  "Pre-meeting prep",
  "Progress check-in",
  "Accommodations question",
  "Other",
] as const;

export type BookingDraft = {
  date: string;
  time: string;
  purpose: string;
  intentId?: string;
};

export function buildPaymentHref(draft: BookingDraft & { intentId: string }) {
  const params = new URLSearchParams({
    intent_id: draft.intentId,
    date: draft.date,
    time: draft.time,
    purpose: draft.purpose,
  });
  return `/advocate/payment?${params.toString()}`;
}

export function buildSuccessHref(draft: {
  date?: string;
  time?: string;
  purpose?: string;
  appointmentId?: string;
  advocateName?: string | null;
}) {
  const params = new URLSearchParams();
  if (draft.date) params.set("date", draft.date);
  if (draft.time) params.set("time", draft.time);
  if (draft.purpose) params.set("purpose", draft.purpose);
  if (draft.appointmentId) params.set("appointment_id", draft.appointmentId);
  if (draft.advocateName) params.set("advocate", draft.advocateName);
  return `/advocate/success?${params.toString()}`;
}

export function parseBookingParams(searchParams: URLSearchParams): BookingDraft {
  return {
    date: searchParams.get("date") || "",
    time: searchParams.get("time") || BOOKING_TIMES[1],
    purpose: searchParams.get("purpose") || BOOKING_PURPOSES[0],
    intentId: searchParams.get("intent_id") || undefined,
  };
}

export function formatBookingDateLabel(isoOrYmd: string): string {
  if (!isoOrYmd) return "Selected date";
  const d = isoOrYmd.includes("T")
    ? new Date(isoOrYmd)
    : new Date(`${isoOrYmd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoOrYmd;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
