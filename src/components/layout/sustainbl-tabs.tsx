"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSession } from "@/components/auth/session-provider";
import { getSustainblTabs } from "@/lib/nav";
import { prefetchForHref } from "@/lib/portal/query/prefetch";

export function SustainblTabs() {
  const pathname = usePathname();
  const { theme } = useAppSession();
  const tabs = getSustainblTabs(theme);
  const qc = useQueryClient();

  return (
    <nav
      className="-mx-1 flex items-center gap-5 overflow-x-auto px-1 pb-px sm:gap-8"
      aria-label="Case file sections"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            onMouseEnter={() => prefetchForHref(qc, tab.href)}
            onFocus={() => prefetchForHref(qc, tab.href)}
            className={
              active
                ? "shrink-0 border-b-2 border-primary pb-3 font-semibold text-primary"
                : "shrink-0 pb-3 text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
