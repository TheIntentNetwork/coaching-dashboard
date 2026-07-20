import type { QueryClient } from "@tanstack/react-query";
import { apiGet } from "@/lib/portal/query/fetcher";
import { portalKeys } from "@/lib/portal/query/query-keys";

function isCaseFileHref(href: string) {
  return href.startsWith("/case-file") || href.startsWith("/sustainbl");
}

/** Warm cache when user hovers primary nav destinations. */
export function prefetchForHref(qc: QueryClient, href: string) {
  if (isCaseFileHref(href)) {
    // Sidebar Case file entry warms common tabs
    if (href === "/case-file" || href === "/case-file/documents" || href === "/sustainbl") {
      void qc.prefetchQuery({
        queryKey: portalKeys.setup(),
        queryFn: () => apiGet("/api/portal/setup"),
        staleTime: 60_000,
      });
      void qc.prefetchQuery({
        queryKey: portalKeys.documents(),
        queryFn: () => apiGet("/api/documents"),
        staleTime: 30_000,
      });
      void qc.prefetchQuery({
        queryKey: portalKeys.prep(),
        queryFn: () => apiGet("/api/portal/prep"),
        staleTime: 30_000,
      });
      return;
    }

    if (href.includes("/documents")) {
      void qc.prefetchQuery({
        queryKey: portalKeys.documents(),
        queryFn: () => apiGet("/api/documents"),
        staleTime: 30_000,
      });
    }
    if (href.includes("/prep")) {
      void qc.prefetchQuery({
        queryKey: portalKeys.prep(),
        queryFn: () => apiGet("/api/portal/prep"),
        staleTime: 30_000,
      });
    }
    if (href.includes("/accommodations")) {
      void qc.prefetchQuery({
        queryKey: portalKeys.accommodations(),
        queryFn: () => apiGet("/api/portal/accommodations"),
        staleTime: 30_000,
      });
      void qc.prefetchQuery({
        queryKey: portalKeys.documents(),
        queryFn: () => apiGet("/api/documents"),
        staleTime: 30_000,
      });
    }
    if (href.includes("/compensatory")) {
      void qc.prefetchQuery({
        queryKey: portalKeys.compensatory(),
        queryFn: () => apiGet("/api/portal/compensatory-plans"),
        staleTime: 30_000,
      });
    }
    if (href.includes("/journey")) {
      void qc.prefetchQuery({
        queryKey: portalKeys.journey(),
        queryFn: () => apiGet("/api/portal/iep-journey"),
        staleTime: 30_000,
      });
    }
  }
  if (href.startsWith("/meetings")) {
    void qc.prefetchQuery({
      queryKey: portalKeys.meetings(),
      queryFn: () => apiGet("/api/portal/meetings"),
      staleTime: 30_000,
    });
  }
  if (href.startsWith("/follow-up")) {
    void qc.prefetchQuery({
      queryKey: portalKeys.messages(),
      queryFn: () => apiGet("/api/portal/messages"),
      staleTime: 15_000,
    });
  }
  if (href.startsWith("/advocate")) {
    void qc.prefetchQuery({
      queryKey: portalKeys.advocate(),
      queryFn: () => apiGet("/api/portal/advocate"),
      staleTime: 5 * 60_000,
    });
    void qc.prefetchQuery({
      queryKey: portalKeys.sessions(),
      queryFn: () => apiGet("/api/portal/sessions"),
      staleTime: 30_000,
    });
  }
  if (href.startsWith("/reports")) {
    void qc.prefetchQuery({
      queryKey: portalKeys.reports(),
      queryFn: () => apiGet("/api/portal/reports"),
      staleTime: 60_000,
    });
  }
  if (href === "/dashboard") {
    void qc.prefetchQuery({
      queryKey: portalKeys.dashboard(),
      queryFn: () => apiGet("/api/portal/dashboard"),
      staleTime: 30_000,
    });
  }
}
