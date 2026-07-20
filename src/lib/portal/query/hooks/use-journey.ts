"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";
import type { JourneyFlags, JourneyMilestone } from "@/lib/portal/iep-journey-defaults";

type JourneyResponse = {
  journey: {
    milestones: JourneyMilestone[];
    flags: JourneyFlags;
  };
};

export function useJourneyQuery() {
  return useQuery({
    queryKey: portalKeys.journey(),
    queryFn: () => apiGet<JourneyResponse>("/api/portal/iep-journey"),
    staleTime: 30_000,
  });
}

export function useJourneyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      milestones: JourneyMilestone[];
      flags: JourneyFlags;
    }) =>
      apiSend<JourneyResponse>("/api/portal/iep-journey", {
        method: "PATCH",
        json: body,
      }),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: portalKeys.journey() });
      const previous = qc.getQueryData<JourneyResponse>(portalKeys.journey());
      qc.setQueryData<JourneyResponse>(portalKeys.journey(), {
        journey: { milestones: body.milestones, flags: body.flags },
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(portalKeys.journey(), ctx.previous);
      }
    },
    onSettled: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.journey() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
      ]);
    },
  });
}
