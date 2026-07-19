"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useDashboardData } from "@/lib/portal/client/use-dashboard-data";

export function PriorityAction() {
  const { data, loading, error } = useDashboardData();
  const priority = data?.priority ?? null;

  return (
    <section className="py-2">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
        Priority Action
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Loader2 className="animate-spin" size={16} />
          Loading…
        </div>
      ) : error ? (
        <p className="text-sm text-tertiary">{error}</p>
      ) : priority ? (
        <div className="flex flex-col items-start gap-3 sm:gap-4 md:flex-row md:justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="mb-2 font-headline text-xl text-on-surface sm:text-2xl md:text-3xl">
              {priority.title}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-on-surface-variant sm:text-base">
              {priority.description}
            </p>
            <Link
              href={priority.href}
              className="inline-flex items-center gap-2 border-b border-primary/30 pb-1 font-bold text-primary transition-all hover:border-primary"
            >
              Start Preparation
              <ArrowRight size={16} />
            </Link>
          </div>
          {priority.dueLabel ? (
            <div className="shrink-0 md:text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-error">
                {priority.dueLabel}
              </span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
          <p className="mb-3 text-on-surface-variant">
            No meeting scheduled yet. Complete your setup to get a personalized prep plan.
          </p>
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 font-bold text-primary transition-all hover:opacity-80"
          >
            Go to Setup
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
