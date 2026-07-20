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
  returnTo?: string;
};

const SAFE_RETURN_PATHS = new Set(["/meetings", "/advocate"]);

export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value) return "/advocate";
  const path = value.startsWith("/") ? value.split("?")[0] : "";
  return SAFE_RETURN_PATHS.has(path) ? path : "/advocate";
}

export function buildPaymentHref(draft: BookingDraft & { intentId: string }) {
  const params = new URLSearchParams({
    intent_id: draft.intentId,
    date: draft.date,
    time: draft.time,
    purpose: draft.purpose,
  });
  if (draft.returnTo) params.set("return_to", sanitizeReturnTo(draft.returnTo));
  return `/advocate/payment?${params.toString()}`;
}

export function buildSuccessHref(draft: {
  date?: string;
  time?: string;
  purpose?: string;
  appointmentId?: string;
  advocateName?: string | null;
  returnTo?: string;
}) {
  const params = new URLSearchParams();
  if (draft.date) params.set("date", draft.date);
  if (draft.time) params.set("time", draft.time);
  if (draft.purpose) params.set("purpose", draft.purpose);
  if (draft.appointmentId) params.set("appointment_id", draft.appointmentId);
  if (draft.advocateName) params.set("advocate", draft.advocateName);
  if (draft.returnTo) params.set("return_to", sanitizeReturnTo(draft.returnTo));
  return `/advocate/success?${params.toString()}`;
}

export function parseBookingParams(searchParams: URLSearchParams): BookingDraft {
  return {
    date: searchParams.get("date") || "",
    time: searchParams.get("time") || BOOKING_TIMES[1],
    purpose: searchParams.get("purpose") || BOOKING_PURPOSES[0],
    intentId: searchParams.get("intent_id") || undefined,
    returnTo: sanitizeReturnTo(searchParams.get("return_to")),
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
