"use client";

import Link from "next/link";
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { useReportDetailQuery } from "@/lib/portal/query/hooks/use-reports";

type ReportDetail = {
  id: string;
  title: string;
  issueDate: string;
  clientName: string;
  advisorName: string | null;
  meetingType: string | null;
  status: string;
  summaryMarkdown: string | null;
  questions: unknown;
  notes: unknown;
  checklist: unknown;
};

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        if (typeof record.title === "string") return record.title;
        if (typeof record.text === "string") return record.text;
        if (typeof record.content === "string") return record.content;
      }
      return null;
    })
    .filter((item): item is string => Boolean(item));
}

export function ReportPdfSection({ id }: { id: string }) {
  const reportQuery = useReportDetailQuery(id);
  const report = (reportQuery.data?.report as ReportDetail | undefined) ?? null;
  const loading = reportQuery.isPending && !reportQuery.data;
  const error = reportQuery.error?.message || null;

  const questions = asStringList(report?.questions);
  const notes = asStringList(report?.notes);
  const checklist = asStringList(report?.checklist);

  return (
    <div>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-outline-variant/40 bg-background/80 px-4 backdrop-blur-md sm:h-16 sm:px-6 lg:px-12">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link
            href="/reports"
            className="flex shrink-0 items-center gap-2 font-label font-medium text-on-surface-variant hover:text-primary"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="hidden h-4 w-px bg-outline-variant sm:block" />
          <h1 className="truncate text-sm font-bold uppercase tracking-tight text-primary">
            Report Viewer
          </h1>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={!report}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-on-primary shadow-soft disabled:opacity-60 sm:px-5"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Download PDF</span>
        </button>
      </header>

      <main className="px-3 py-5 sm:px-6 sm:py-8 lg:px-12">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-on-surface-variant">
            <Loader2 className="animate-spin" size={20} />
            Loading report…
          </div>
        ) : error || !report ? (
          <p className="mx-auto max-w-[850px] rounded-xl border border-tertiary/30 bg-tertiary/5 px-6 py-8 text-sm text-tertiary">
            {error || "Report not found."}
          </p>
        ) : (
          <article className="relative mx-auto min-h-[1100px] max-w-[850px] border border-outline-variant/30 bg-white p-6 shadow-soft sm:p-10 md:p-16">
            <div className="mb-8 flex flex-col gap-4 border-b-[3px] border-primary pb-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
              <div>
                <p className="mb-2 font-label text-xs font-bold uppercase tracking-widest text-primary">
                  Official Synthesis Report
                </p>
                <h2 className="mb-2 font-headline text-3xl leading-none text-on-surface sm:text-5xl md:text-6xl">
                  {report.title}
                </h2>
                <p className="font-label text-sm italic text-on-surface-variant">
                  Prepared for {report.clientName}
                  {report.advisorName ? ` · Facilitated by ${report.advisorName}` : ""}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-label font-bold text-on-surface">
                  {report.issueDate || "Date pending"}
                </p>
                <p className="font-label text-xs uppercase tracking-tighter text-on-surface-variant">
                  Issue Date
                </p>
              </div>
            </div>

            <section className="mb-10 sm:mb-16">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
                <div className="sm:w-1/3">
                  <h3 className="border-l-2 border-primary-container pl-4 font-headline text-xl italic text-primary sm:text-2xl">
                    Executive Summary
                  </h3>
                </div>
                <div className="sm:w-2/3">
                  {report.summaryMarkdown ? (
                    <MarkdownContent content={report.summaryMarkdown} />
                  ) : (
                    <p className="font-body leading-relaxed text-on-surface-variant">
                      No summary is available yet for this meeting. Once your meeting is completed
                      and summarized, the full report will appear here.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {questions.length > 0 ? (
              <section className="mb-10 sm:mb-16">
                <h3 className="mb-6 font-headline text-2xl text-on-surface sm:mb-8 sm:text-3xl">
                  Questions Discussed
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  {questions.map((item) => (
                    <div
                      key={item}
                      className="border-l-4 border-primary bg-surface-container-low p-6"
                    >
                      <p className="font-body text-sm leading-snug text-on-surface-variant">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {notes.length > 0 ? (
              <section className="mb-10 sm:mb-16">
                <h3 className="mb-6 font-headline text-2xl text-on-surface sm:mb-8 sm:text-3xl">
                  Notes
                </h3>
                <ul className="space-y-3">
                  {notes.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {checklist.length > 0 ? (
              <section className="mb-10 sm:mb-16">
                <h3 className="mb-6 font-headline text-2xl text-on-surface sm:mb-8 sm:text-3xl">
                  Checklist
                </h3>
                <ul className="space-y-2">
                  {checklist.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-on-surface-variant">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <footer className="mt-12 flex flex-col items-center gap-3 border-t border-outline-variant/40 pt-8 text-center font-label text-[10px] uppercase tracking-widest text-on-surface-variant sm:mt-20 sm:flex-row sm:justify-between sm:pt-12 sm:text-left">
              <div>SustainBL Report</div>
              <div className="flex items-center gap-2">
                <BrandLogo href={undefined} size="sm" />
                <span>Client Portal</span>
              </div>
              <div>ID: {report.id.slice(0, 8).toUpperCase()}</div>
            </footer>
          </article>
        )}

        <button
          type="button"
          onClick={() => window.print()}
          disabled={!report}
          className="fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-on-surface text-surface shadow-soft transition-transform hover:scale-110 disabled:opacity-50 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14"
          aria-label="Print"
        >
          <Printer size={20} />
        </button>
      </main>
    </div>
  );
}
