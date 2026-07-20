"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";
import type {
  PortalMeetingDetail,
  PortalMeetingListItem,
} from "@/lib/portal/types";

export function useMeetingsQuery() {
  return useQuery({
    queryKey: portalKeys.meetings(),
    queryFn: () =>
      apiGet<{ meetings: PortalMeetingListItem[] }>("/api/portal/meetings"),
    staleTime: 30_000,
  });
}

export function useMeetingDetailQuery(id: string) {
  return useQuery({
    queryKey: portalKeys.meeting(id),
    queryFn: () =>
      apiGet<{ meeting: PortalMeetingDetail }>(`/api/portal/meetings/${id}`),
    enabled: Boolean(id),
    staleTime: 20_000,
  });
}
