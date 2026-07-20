import { SustainblTabs } from "@/components/layout/sustainbl-tabs";

export default function CaseFileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="page-pad-x border-b border-outline-variant/20 pt-6 sm:pt-8">
        <SustainblTabs />
      </div>
      {children}
    </div>
  );
}
