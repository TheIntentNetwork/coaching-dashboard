"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";

export type AccommodationItem = {
  id: string;
  title: string;
  description: string | null;
  service_kind: "accommodation" | "supportive_service";
  status: "draft" | "active" | "archived";
  document_ids: string[];
};

export function useAccommodationsQuery() {
  return useQuery({
    queryKey: portalKeys.accommodations(),
    queryFn: () =>
      apiGet<{ items: AccommodationItem[] }>("/api/portal/accommodations"),
    staleTime: 30_000,
  });
}

export function useAccommodationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      id?: string | null;
      body: Record<string, unknown>;
    }) => {
      if (params.id) {
        return apiSend<{ item: AccommodationItem }>(
          `/api/portal/accommodations/${params.id}`,
          { method: "PATCH", json: params.body },
        );
      }
      return apiSend<{ item: AccommodationItem }>("/api/portal/accommodations", {
        method: "POST",
        json: params.body,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.accommodations() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
      ]);
    },
  });
}

export function useDeleteAccommodationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiSend(`/api/portal/accommodations/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.accommodations() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
      ]);
    },
  });
}
