"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";
import type { PortalAdvocate } from "@/lib/portal/types";
import type { SessionBalance } from "@/lib/portal/session-grants";

export function useAdvocateQuery() {
  return useQuery({
    queryKey: portalKeys.advocate(),
    queryFn: () =>
      apiGet<{ advocate: PortalAdvocate | null }>("/api/portal/advocate"),
    staleTime: 5 * 60_000,
  });
}

export function useSessionsQuery() {
  return useQuery({
    queryKey: portalKeys.sessions(),
    queryFn: () => apiGet<{ balance: SessionBalance | null }>("/api/portal/sessions"),
    staleTime: 30_000,
  });
}

export type AvailabilityDay = { date: string; times: string[] };

export function useAvailabilityQuery() {
  return useQuery({
    queryKey: portalKeys.availability(),
    queryFn: () =>
      apiGet<{ days?: AvailabilityDay[] }>("/api/portal/availability"),
    staleTime: 60_000,
  });
}

export function useBookingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      date: string;
      time: string;
      purpose: string;
      attendRemotely?: boolean;
    }) =>
      apiSend<{
        mode: string;
        appointmentId?: string;
        intentId?: string;
        balance?: SessionBalance;
        advocateName?: string | null;
        error?: string;
      }>("/api/portal/bookings", { method: "POST", json: body }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.meetings() }),
        qc.invalidateQueries({ queryKey: portalKeys.sessions() }),
        qc.invalidateQueries({ queryKey: portalKeys.availability() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
      ]);
    },
  });
}

export function useBookingConfirmMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiSend("/api/portal/bookings/confirm", { method: "POST", json: body }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.meetings() }),
        qc.invalidateQueries({ queryKey: portalKeys.sessions() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
      ]);
    },
  });
}
