"use client";

import { useCallback, useEffect, useState } from "react";
import type { PortalSetup } from "@/lib/portal/types";

/** Loads and caches the current user's portal setup record for the setup wizard. */
export function usePortalSetup() {
  const [setup, setSetup] = useState<PortalSetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/portal/setup");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load setup");
        return null;
      }
      setSetup(json.setup ?? null);
      return (json.setup ?? null) as PortalSetup | null;
    } catch {
      setError("Failed to load setup");
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await reload();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  return { setup, loading, error, reload, setSetup };
}
