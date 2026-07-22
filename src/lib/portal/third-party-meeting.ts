export type PortalThirdPartyMeeting = {
  url: string;
  label: "zoom" | "meet" | "other";
};

export function parseThirdPartyMeeting(
  extraData: unknown,
): PortalThirdPartyMeeting | null {
  if (!extraData || typeof extraData !== "object" || Array.isArray(extraData)) {
    return null;
  }
  const raw = (extraData as Record<string, unknown>).third_party_meeting;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const url = typeof row.url === "string" ? row.url.trim() : "";
  if (!url) return null;
  const label =
    row.label === "zoom" || row.label === "meet" || row.label === "other"
      ? row.label
      : "other";
  return { url, label };
}

export function thirdPartyProviderLabel(
  label: PortalThirdPartyMeeting["label"],
): string {
  if (label === "zoom") return "Zoom";
  if (label === "meet") return "Google Meet";
  return "a third-party meeting service";
}
