import { IepOnlyGate } from "@/components/sustainbl/iep-only-gate";
import { CompensatorySection } from "@/components/sustainbl/compensatory-section";

export default function CompensatoryPage() {
  return (
    <IepOnlyGate>
      <CompensatorySection />
    </IepOnlyGate>
  );
}
