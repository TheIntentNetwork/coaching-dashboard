export type ServiceType = "iep" | "coaching" | "vaclaims";

/** Portal theme derived from service type (IEP vs coaching). */
export type PortalTheme = "iep" | "coaching";

export function resolveServiceType(raw: string | null | undefined): ServiceType {
  const value = (raw || "vaclaims").toLowerCase().trim();
  if (value === "coaching") return "coaching";
  if (value === "iep" || value === "iep-services" || value === "advocacy") return "iep";
  return "vaclaims";
}

export function resolvePortalTheme(serviceType: ServiceType): PortalTheme {
  // Brand portal is IEP or Coaching only. Treat anything else (e.g. vaclaims
  // leftover profiles) as IEP so nav/copy stay correct for advocacy users.
  return serviceType === "coaching" ? "coaching" : "iep";
}

export function isPortalServiceType(value: string): value is PortalTheme {
  return value === "iep" || value === "coaching";
}

export const SERVICE_COPY: Record<
  PortalTheme,
  {
    tagline: string;
    coachNavLabel: string;
    coachNoun: string;
    programLabel: string;
  }
> = {
  iep: {
    tagline: "IEP Parent Journey",
    coachNavLabel: "My Advocate",
    coachNoun: "advocate",
    programLabel: "IEP Services",
  },
  coaching: {
    tagline: "Coaching Journey",
    coachNavLabel: "My Coach",
    coachNoun: "coach",
    programLabel: "Life Coaching",
  },
};
