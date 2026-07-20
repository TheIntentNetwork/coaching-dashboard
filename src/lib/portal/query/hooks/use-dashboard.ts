"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";
import type { PortalDashboardResponse } from "@/lib/portal/types";

export function useDashboardQuery() {
  return useQuery({
    queryKey: portalKeys.dashboard(),
    queryFn: () => apiGet<PortalDashboardResponse>("/api/portal/dashboard"),
    staleTime: 30_000,
  });
}
