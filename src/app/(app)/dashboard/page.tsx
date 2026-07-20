import { DashboardHero } from "@/components/dashboard/hero";
import { PriorityAction } from "@/components/dashboard/priority-action";
import { UpcomingMeeting } from "@/components/dashboard/upcoming-meeting";
import { PageShell } from "@/components/layout/page-shell";

export default function DashboardPage() {
  return (
    <PageShell>
      <DashboardHero />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-7">
          <PriorityAction />
        </div>
        <div className="lg:col-span-5">
          <UpcomingMeeting />
        </div>
      </div>
    </PageShell>
  );
}
