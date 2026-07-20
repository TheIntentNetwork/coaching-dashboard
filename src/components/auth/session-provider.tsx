"use client";

import { createContext, useContext } from "react";
import type { AppSession } from "@/lib/auth/session";
import { SERVICE_COPY, type PortalTheme } from "@/lib/auth/service-type";

type SessionContextValue = AppSession & {
  copy: (typeof SERVICE_COPY)[PortalTheme];
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: AppSession;
  children: React.ReactNode;
}) {
  const value: SessionContextValue = {
    ...session,
    copy: SERVICE_COPY[session.theme],
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAppSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useAppSession must be used within SessionProvider");
  }
  return ctx;
}
