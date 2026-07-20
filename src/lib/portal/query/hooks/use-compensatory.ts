"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";

export type CompensatoryPlan = {
  id: string;
  title: string;
  summary: string | null;
  missed_services: string | null;
  timeframe_start: string | null;
  timeframe_end: string | null;
  status: "draft" | "submitted" | "in_progress" | "closed";
  advisor_note: string | null;
  document_ids: string[];
};

export function useCompensatoryQuery() {
  return useQuery({
    queryKey: portalKeys.compensatory(),
    queryFn: () =>
      apiGet<{ items: CompensatoryPlan[] }>("/api/portal/compensatory-plans"),
    staleTime: 30_000,
  });
}

export function useCompensatoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      id?: string | null;
      body: Record<string, unknown>;
    }) => {
      if (params.id) {
        return apiSend<{ item: CompensatoryPlan }>(
          `/api/portal/compensatory-plans/${params.id}`,
          { method: "PATCH", json: params.body },
        );
      }
      return apiSend<{ item: CompensatoryPlan }>(
        "/api/portal/compensatory-plans",
        { method: "POST", json: params.body },
      );
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.compensatory() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
      ]);
    },
  });
}

export function useDeleteCompensatoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiSend(`/api/portal/compensatory-plans/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.compensatory() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
      ]);
    },
  });
}
