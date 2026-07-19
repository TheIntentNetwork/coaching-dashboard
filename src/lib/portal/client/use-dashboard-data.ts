"use client";

import { useEffect, useState } from "react";
import type { PortalDashboardResponse } from "@/lib/portal/types";

/** Shared fetch for /api/portal/dashboard, used by hero, priority action, and upcoming meeting. */
export function useDashboardData() {
  const [data, setData] = useState<PortalDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/portal/dashboard");
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || "Failed to load dashboard");
        } else {
          setData(json as PortalDashboardResponse);
        }
      } catch {
        if (!cancelled) setError("Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
