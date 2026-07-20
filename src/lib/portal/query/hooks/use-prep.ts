"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";

export function usePrepQuery() {
  return useQuery({
    queryKey: portalKeys.prep(),
    queryFn: () => apiGet<{ items: unknown[] }>("/api/portal/prep"),
    staleTime: 30_000,
  });
}

export function usePrepMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      method: "POST" | "PATCH";
      body: Record<string, unknown>;
    }) =>
      apiSend("/api/portal/prep", {
        method: params.method,
        json: params.body,
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.prep() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
      ]);
    },
  });
}

export function useDeletePrepMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiSend(`/api/portal/prep?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.prep() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
      ]);
    },
  });
}
