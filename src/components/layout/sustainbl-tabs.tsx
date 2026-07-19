"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SUSTAINBL_TABS } from "@/lib/nav";

export function SustainblTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="-mx-1 flex items-center gap-5 overflow-x-auto px-1 pb-px sm:gap-8"
      aria-label="SustainBL sections"
    >
      {SUSTAINBL_TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.id}
            href={tab.href}
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
