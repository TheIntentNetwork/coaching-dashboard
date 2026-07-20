import type { PortalTheme } from "@/lib/auth/service-type";
import { SERVICE_COPY } from "@/lib/auth/service-type";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
};

/** Primary sidebar — Case file sub-tabs live under /case-file routes */
export function getSidebarNav(
  theme: PortalTheme,
  options?: { includeSetup?: boolean },
): NavItem[] {
  const copy = SERVICE_COPY[theme];
  const includeSetup = options?.includeSetup ?? true;

  const items: NavItem[] = [];
  if (includeSetup) {
    items.push({ id: "setup", label: "Set Schedule", href: "/setup", icon: "settings" });
  }

  items.push(
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "home" },
    {
      id: "case-file",
      label: "Case file",
      href: "/case-file/documents",
      icon: "book-open",
    },
    { id: "meetings", label: "Meetings", href: "/meetings", icon: "mic" },
    { id: "follow-up", label: "Messages", href: "/follow-up", icon: "mail" },
    { id: "reports", label: "Reports", href: "/reports", icon: "file-text" },
    {
      id: "my-advocate",
      label: copy.coachNavLabel,
      href: "/advocate",
      icon: "user",
    },
  );

  return items;
}

/** @deprecated Prefer getSidebarNav(theme) */
export const SIDEBAR_NAV: NavItem[] = getSidebarNav("iep");

const BASE_CASE_FILE_TABS: NavItem[] = [
  { id: "documents", label: "Documents", href: "/case-file/documents", icon: "folder" },
  { id: "prep", label: "Prep", href: "/case-file/prep", icon: "list" },
];

const IEP_ONLY_TABS: NavItem[] = [
  {
    id: "accommodations",
    label: "Accommodations",
    href: "/case-file/accommodations",
    icon: "list",
  },
  {
    id: "compensatory",
    label: "Compensatory",
    href: "/case-file/compensatory",
    icon: "file-text",
  },
  {
    id: "journey",
    label: "Journey",
    href: "/case-file/journey",
    icon: "timeline",
  },
];

/** Tabs inside Case file — IEP gets domain tabs; coaching keeps Documents + Prep. */
export function getSustainblTabs(theme: PortalTheme): NavItem[] {
  if (theme === "iep") {
    return [BASE_CASE_FILE_TABS[0], ...IEP_ONLY_TABS, BASE_CASE_FILE_TABS[1]];
  }
  return BASE_CASE_FILE_TABS;
}

/** Alias for Case file tab helper */
export const getCaseFileTabs = getSustainblTabs;

/** @deprecated Prefer getCaseFileTabs(theme) */
export const SUSTAINBL_TABS: NavItem[] = getSustainblTabs("iep");

export const CHILD_NAME = "Avery";
