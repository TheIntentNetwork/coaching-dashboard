import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

export function AuthFooter() {
  return (
    <footer className="border-t border-outline-variant/60 bg-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-8 sm:py-12 md:flex-row">
        <BrandLogo href="/" size="sm" />
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          <Link
            href="#"
            className="font-body text-xs uppercase tracking-widest text-on-surface-variant opacity-80 transition-colors hover:text-tertiary hover:opacity-100"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="font-body text-xs uppercase tracking-widest text-on-surface-variant opacity-80 transition-colors hover:text-tertiary hover:opacity-100"
          >
            Terms of Service
          </Link>
          <Link
            href="/advocate"
            className="font-body text-xs uppercase tracking-widest text-on-surface-variant opacity-80 transition-colors hover:text-tertiary hover:opacity-100"
          >
            Contact Support
          </Link>
        </div>
        <p className="font-body text-xs uppercase tracking-widest text-on-surface-variant opacity-60">
          © 2026 SustainBL. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
