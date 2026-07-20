import { Suspense } from "react";
import { AdvocatePaymentScreen } from "@/components/advocate/advocate-payment-screen";

export default function AdvocatePaymentPage() {
  return (
    <Suspense fallback={<div className="page-pad text-on-surface-variant">Loading payment…</div>}>
      <AdvocatePaymentScreen />
    </Suspense>
  );
}
