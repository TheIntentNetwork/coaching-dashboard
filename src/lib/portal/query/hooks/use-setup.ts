"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";
import type { PortalSetup } from "@/lib/portal/types";

type SetupResponse = { setup: PortalSetup | null };

export function useSetupQuery() {
  return useQuery({
    queryKey: portalKeys.setup(),
    queryFn: async () => {
      const json = await apiGet<SetupResponse>("/api/portal/setup");
      return json.setup ?? null;
    },
    staleTime: 60_000,
  });
}

export function useSetupMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiSend<SetupResponse>("/api/portal/setup", {
        method: "PATCH",
        json: body,
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.setup() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
        qc.invalidateQueries({ queryKey: portalKeys.availability() }),
        qc.invalidateQueries({ queryKey: portalKeys.meetings() }),
      ]);
    },
  });
}

export function useSetupSubmitMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiSend<SetupResponse>("/api/portal/setup", {
        method: "POST",
        json: body,
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.setup() }),
        qc.invalidateQueries({ queryKey: portalKeys.documents() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
        qc.invalidateQueries({ queryKey: portalKeys.meetings() }),
      ]);
    },
  });
}
