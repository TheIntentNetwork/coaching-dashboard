"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";

export function useReportsQuery() {
  return useQuery({
    queryKey: portalKeys.reports(),
    queryFn: () => apiGet<{ reports: unknown[] }>("/api/portal/reports"),
    staleTime: 60_000,
  });
}

export function useReportDetailQuery(id: string) {
  return useQuery({
    queryKey: portalKeys.report(id),
    queryFn: () =>
      apiGet<{ report: Record<string, unknown> }>(`/api/portal/reports/${id}`),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
