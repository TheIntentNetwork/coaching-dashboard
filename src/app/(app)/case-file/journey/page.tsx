import { IepOnlyGate } from "@/components/sustainbl/iep-only-gate";
import { JourneySection } from "@/components/sustainbl/journey-section";

export default function JourneyPage() {
  return (
    <IepOnlyGate>
      <JourneySection />
    </IepOnlyGate>
  );
}
