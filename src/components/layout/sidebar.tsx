"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Icon } from "@/components/ui/icon";
import { useAppSession } from "@/components/auth/session-provider";
import { signOutAction } from "@/lib/auth/actions";
import { getSidebarNav } from "@/lib/nav";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/sustainbl") return pathname.startsWith("/sustainbl");
  if (href === "/meetings") return pathname.startsWith("/meetings");
  if (href === "/reports") return pathname.startsWith("/reports");
  if (href === "/setup") return pathname.startsWith("/setup");
  if (href === "/advocate") return pathname.startsWith("/advocate");
  if (href === "/ask-copilot") return pathname.startsWith("/ask-copilot");
  if (href === "/follow-up") return pathname.startsWith("/follow-up");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  onNavigate,
  compact = false,
  includeSetup = true,
}: {
  onNavigate?: () => void;
  compact?: boolean;
  includeSetup?: boolean;
}) {
  const pathname = usePathname();
  const { theme } = useAppSession();
  const nav = getSidebarNav(theme, { includeSetup });

  return (
    <>
      {nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            className={
              active
                ? `${compact ? "mx-1" : "mx-2"} mb-1 flex items-center gap-3 rounded-lg bg-primary-container px-3 py-2.5 font-bold text-on-primary-container sm:px-4 sm:py-3`
                : `${compact ? "mx-1" : "mx-2"} mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-variant/50 sm:px-4 sm:py-3`
            }
          >
            <Icon name={item.icon} size={20} />
            <span className="font-body text-sm">{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="space-y-1 border-t border-outline-variant/30 p-3 sm:p-4">
      <Link
        href="/ask-copilot"
        onClick={onNavigate}
        className={
          isActive(pathname, "/ask-copilot")
            ? "flex items-center gap-3 px-3 py-2 text-sm font-bold text-primary sm:px-4"
            : "flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-primary sm:px-4"
        }
      >
        <Sparkles size={18} />
        Ask Copilot
      </Link>
      <Link
        href="/settings"
        onClick={onNavigate}
        className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-primary sm:px-4"
      >
        <Icon name="settings" size={18} />
        Settings
      </Link>
      <form action={signOutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-primary sm:px-4"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </form>
    </div>
  );
}

function SidebarBrand({ onNavigate }: { onNavigate?: () => void }) {
  const { theme, copy, displayName } = useAppSession();
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="border-b border-outline-variant/30 px-4 py-4 sm:px-5 sm:py-6">
      <BrandLogo
        href="/dashboard"
        size="md"
        showWordmark
        tagline={copy.tagline}
        theme={theme}
        priority
        onClick={onNavigate}
      />
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-outline-variant/50 bg-surface-container-low font-label text-xs font-bold text-primary">
          {initials || "U"}
        </div>
        <p className="truncate font-body text-sm font-medium text-on-surface">{displayName}</p>
      </div>
    </div>
  );
}

const SETUP_HIDDEN_STATUSES = new Set(["submitted", "under_review", "approved"]);

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [includeSetup, setIncludeSetup] = useState(true);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/portal/setup");
        const json = await res.json();
        if (cancelled || !res.ok) return;
        const status = json.setup?.status as string | undefined;
        setIncludeSetup(!status || !SETUP_HIDDEN_STATUSES.has(status));
      } catch {
        // Keep Setup visible if status can't be loaded.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-outline-variant/50 bg-surface-container-low/95 px-4 backdrop-blur-md lg:hidden">
        <BrandLogo href="/dashboard" size="sm" showWordmark priority />
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-surface-variant/60"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-outline-variant/60 bg-surface-container-low lg:flex">
        <SidebarBrand />
        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-2">
          <NavLinks includeSetup={includeSetup} />
        </nav>
        <SidebarFooter />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-[2px] lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="fixed left-0 top-0 z-50 flex h-screen w-[min(20rem,88vw)] flex-col border-r border-outline-variant/60 bg-surface-container-low shadow-soft lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/30 px-4 py-3">
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Menu
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-variant/60"
                >
                  <X size={20} />
                </button>
              </div>
              <SidebarBrand onNavigate={() => setOpen(false)} />
              <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-1">
                <NavLinks
                  compact
                  includeSetup={includeSetup}
                  onNavigate={() => setOpen(false)}
                />
              </nav>
              <SidebarFooter onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
