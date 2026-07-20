"use client";

import { useDashboardQuery } from "@/lib/portal/query/hooks/use-dashboard";

/** Shared dashboard query — Hero / Priority / Upcoming all share one cache entry. */
export function useDashboardData() {
  const query = useDashboardQuery();
  return {
    data: query.data ?? null,
    loading: query.isPending && !query.data,
    error: query.error ? query.error.message : null,
  };
}
