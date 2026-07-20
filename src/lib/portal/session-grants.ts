export type SessionBalance = {
  enrollmentId: string;
  advisorId: string;
  program: string | null;
  planName: string | null;
  packageLabel: string;
  sessionsIncluded: number;
  sessionsConsumed: number;
  sessionsRemaining: number;
  extraSessionPriceCents: number;
  extraSessionPriceLabel: string;
};

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function parseSessionCountFromPlanName(planName: string | null | undefined): number | null {
  if (!planName) return null;
  const normalized = planName.replace(/[–—]/g, "-").toLowerCase();
  const pack = normalized.match(/(\d+)\s*sessions?/);
  if (pack) return Number(pack[1]);
  if (/single\s*session|self\s*pay\s*session/.test(normalized)) return 1;
  if (/full\s*year/.test(normalized)) return 12;
  if (/iep/.test(normalized)) return 2;
  return null;
}
