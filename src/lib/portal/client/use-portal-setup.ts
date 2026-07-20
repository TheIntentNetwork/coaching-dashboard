"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSetupQuery } from "@/lib/portal/query/hooks/use-setup";
import { apiGet } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";
import type { PortalSetup } from "@/lib/portal/types";

/** Loads portal setup via TanStack Query (shared with sidebar + setup wizard). */
export function usePortalSetup() {
  const query = useSetupQuery();
  const qc = useQueryClient();

  const reload = useCallback(async () => {
    return qc.fetchQuery({
      queryKey: portalKeys.setup(),
      queryFn: async () => {
        const json = await apiGet<{ setup: PortalSetup | null }>("/api/portal/setup");
        return json.setup ?? null;
      },
    });
  }, [qc]);

  const setSetup = useCallback(
    (value: PortalSetup | null | ((prev: PortalSetup | null) => PortalSetup | null)) => {
      qc.setQueryData<PortalSetup | null>(portalKeys.setup(), (prev) => {
        const current = prev ?? null;
        return typeof value === "function" ? value(current) : value;
      });
    },
    [qc],
  );

  return {
    setup: query.data ?? null,
    loading: query.isPending && query.data === undefined,
    error: query.error ? query.error.message : null,
    reload,
    setSetup,
  };
}
