"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";

export type MessageThread = {
  id: string;
  subject?: string | null;
  unreadCount?: number;
  [key: string]: unknown;
};

export type MessageItem = {
  id: string;
  body?: string;
  [key: string]: unknown;
};

type ThreadsResponse = { threads: MessageThread[] };
type ThreadResponse = {
  thread?: MessageThread;
  messages?: MessageItem[];
  [key: string]: unknown;
};

export function useMessagesQuery() {
  return useQuery({
    queryKey: portalKeys.messages(),
    queryFn: () => apiGet<ThreadsResponse>("/api/portal/messages"),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useMessageThreadQuery(threadId: string | null) {
  return useQuery({
    queryKey: portalKeys.messageThread(threadId || ""),
    queryFn: () => apiGet<ThreadResponse>(`/api/portal/messages/${threadId}`),
    enabled: Boolean(threadId),
    staleTime: 10_000,
  });
}

export function useSendMessageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      threadId?: string | null;
      body: string;
      subject?: string;
    }) => {
      if (params.threadId) {
        return apiSend<ThreadResponse>(`/api/portal/messages/${params.threadId}`, {
          method: "POST",
          json: { body: params.body },
        });
      }
      return apiSend<ThreadResponse>("/api/portal/messages", {
        method: "POST",
        json: { body: params.body, subject: params.subject },
      });
    },
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: portalKeys.messages() });
      if (vars.threadId) {
        await qc.invalidateQueries({
          queryKey: portalKeys.messageThread(vars.threadId),
        });
      }
    },
  });
}
