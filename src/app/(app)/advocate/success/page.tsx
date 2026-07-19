import { Suspense } from "react";
import { AdvocateSuccessScreen } from "@/components/advocate/advocate-success-screen";

export default function AdvocateSuccessPage() {
  return (
    <Suspense fallback={<div className="page-pad text-on-surface-variant">Loading…</div>}>
      <AdvocateSuccessScreen />
    </Suspense>
  );
}
