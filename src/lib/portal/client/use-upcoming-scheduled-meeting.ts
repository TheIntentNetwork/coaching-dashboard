"use client";

import { useMemo } from "react";
import { useDashboardData } from "@/lib/portal/client/use-dashboard-data";
import { usePortalSetup } from "@/lib/portal/client/use-portal-setup";
import {
  findUpcomingScheduledMeeting,
  type UpcomingScheduledMeetingInfo,
} from "@/lib/portal/upcoming-scheduled-meeting";
import { useMeetingsQuery } from "@/lib/portal/query/hooks/use-meetings";

export function useUpcomingScheduledMeeting(): UpcomingScheduledMeetingInfo | null {
  const { setup } = usePortalSetup();
  const { data: dashboard } = useDashboardData();
  const meetingsQuery = useMeetingsQuery();
  const meetings = meetingsQuery.data?.meetings || [];

  return useMemo(
    () =>
      findUpcomingScheduledMeeting({
        setup,
        dashboard,
        meetings,
      }),
    [setup, dashboard, meetings],
  );
}
