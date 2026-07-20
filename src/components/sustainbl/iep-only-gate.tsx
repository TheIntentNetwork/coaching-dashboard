"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAppSession } from "@/components/auth/session-provider";

/** Redirects coaching (and other) themes away from IEP-only SustainBL tabs. */
export function IepOnlyGate({ children }: { children: React.ReactNode }) {
  const { theme } = useAppSession();
  const router = useRouter();

  useEffect(() => {
    if (theme !== "iep") {
      router.replace("/case-file/documents");
    }
  }, [theme, router]);

  if (theme !== "iep") {
    return (
      <div className="flex items-center gap-2 page-pad text-on-surface-variant">
        <Loader2 className="animate-spin" size={18} />
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
