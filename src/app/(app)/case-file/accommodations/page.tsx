import { IepOnlyGate } from "@/components/sustainbl/iep-only-gate";
import { AccommodationsSection } from "@/components/sustainbl/accommodations-section";

export default function AccommodationsPage() {
  return (
    <IepOnlyGate>
      <AccommodationsSection />
    </IepOnlyGate>
  );
}
