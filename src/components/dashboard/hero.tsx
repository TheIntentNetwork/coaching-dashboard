"use client";

import { useAppSession } from "@/components/auth/session-provider";
import { PageHeader } from "@/components/layout/page-shell";
import { useDashboardData } from "@/lib/portal/client/use-dashboard-data";

export function DashboardHero() {
  const { displayName } = useAppSession();
  const { data } = useDashboardData();
  const studentName = data?.iepProfile?.childName || data?.studentName || null;

  return (
    <PageHeader
      eyebrow="Overview"
      title={<>Welcome back, {displayName}.</>}
      description={
        studentName
          ? `Your advocacy journey continues. Here is the current status of ${studentName}'s IEP and upcoming milestones.`
          : "Your advocacy journey continues. Here is the current status of your IEP and upcoming milestones."
      }
    />
  );
}
