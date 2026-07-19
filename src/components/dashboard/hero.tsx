"use client";

import { useAppSession } from "@/components/auth/session-provider";
import { useDashboardData } from "@/lib/portal/client/use-dashboard-data";

export function DashboardHero() {
  const { displayName } = useAppSession();
  const { data } = useDashboardData();
  const studentName = data?.studentName || null;

  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex flex-col gap-3 border-b border-outline-variant/20 pb-5 sm:pb-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Overview</span>
        <h1 className="page-title font-normal">
          Welcome back, {displayName}.
        </h1>
        <p className="max-w-2xl font-body text-sm text-on-surface-variant sm:text-base md:text-lg">
          {studentName
            ? `Your advocacy journey continues. Here is the current status of ${studentName}'s IEP and upcoming milestones.`
            : "Your advocacy journey continues. Here is the current status of your IEP and upcoming milestones."}
        </p>
      </div>
    </header>
  );
}
