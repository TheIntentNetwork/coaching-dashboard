"use client";

import Link from "next/link";
import { FileText, Loader2 } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { useReportsQuery } from "@/lib/portal/query/hooks/use-reports";

type ReportListItem = {
  id: string;
  date: string;
  name: string;
  meeting: string;
  status: string;
  hasSummary: boolean;
};

export function ReportsListSection() {
  const reportsQuery = useReportsQuery();
  const reports = (reportsQuery.data?.reports || []) as ReportListItem[];
  const loading = reportsQuery.isPending && !reportsQuery.data;
  const error = reportsQuery.error?.message || null;

  return (
    <PageShell>
      <PageHeader
        title="Reports"
        description="Access and export curated summaries from your meetings and preparation history."
      />

      {error ? (
        <p className="mb-6 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-3 py-16 text-on-surface-variant">
          <Loader2 className="animate-spin" size={18} />
          Loading reports…
        </div>
      ) : reports.length === 0 ? (
        <p className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-6 py-12 text-on-surface-variant">
          No reports yet. After your advocate completes a meeting summary, it will appear here.
        </p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {reports.map((r) => (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="block rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-soft transition-colors hover:border-primary/40"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h2 className="font-headline text-lg text-on-surface">{r.name}</h2>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      r.hasSummary
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="mb-1 text-sm text-on-surface-variant">{r.date}</p>
                <p className="text-sm text-on-surface-variant">{r.meeting}</p>
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <div className="grid grid-cols-12 border-b border-outline-variant/60 px-4 pb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/80">
              <div className="col-span-2">Date</div>
              <div className="col-span-4">Report Name</div>
              <div className="col-span-3">Meeting Reference</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {reports.map((r) => (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="group grid cursor-pointer grid-cols-12 items-center border-b border-outline-variant/30 px-4 py-6 transition-all duration-300 hover:bg-primary/[0.03]"
              >
                <div className="col-span-2 font-body text-on-surface-variant">{r.date}</div>
                <div className="col-span-4">
                  <span className="font-headline text-xl text-on-surface transition-colors group-hover:text-primary">
                    {r.name}
                  </span>
                </div>
                <div className="col-span-3 font-body text-on-surface-variant">{r.meeting}</div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      r.hasSummary
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <FileText
                    size={20}
                    className="ml-auto text-primary opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
