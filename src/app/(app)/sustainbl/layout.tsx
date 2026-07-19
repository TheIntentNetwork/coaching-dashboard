import { SustainblTabs } from "@/components/layout/sustainbl-tabs";

export default function SustainblLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="page-pad-x border-b border-outline-variant/20 pt-6 sm:pt-8">
        <SustainblTabs />
      </div>
      {children}
    </div>
  );
}
