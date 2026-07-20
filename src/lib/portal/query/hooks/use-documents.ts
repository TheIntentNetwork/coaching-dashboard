"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, ApiError } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";

export type PortalDocumentRow = {
  id: string;
  name: string;
  mime_type: string | null;
  status: string;
  error_message: string | null;
  byte_size: number | null;
  purpose: string | null;
  created_at: string;
  updated_at: string;
};

type DocumentsResponse = { documents: PortalDocumentRow[] };

export function useDocumentsQuery() {
  return useQuery({
    queryKey: portalKeys.documents(),
    queryFn: () => apiGet<DocumentsResponse>("/api/documents"),
    staleTime: 30_000,
  });
}

export function useUploadDocumentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: FormData) => {
      const res = await fetch("/api/documents", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new ApiError(json.error || "Upload failed", res.status);
      return json as { document?: PortalDocumentRow; warning?: string };
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.documents() }),
        qc.invalidateQueries({ queryKey: portalKeys.accommodations() }),
        qc.invalidateQueries({ queryKey: portalKeys.setup() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
      ]);
    },
  });
}

export function useDeleteDocumentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(json.error || "Delete failed", res.status);
      return json;
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: portalKeys.documents() }),
        qc.invalidateQueries({ queryKey: portalKeys.accommodations() }),
        qc.invalidateQueries({ queryKey: portalKeys.setup() }),
        qc.invalidateQueries({ queryKey: portalKeys.dashboard() }),
      ]);
    },
  });
}
