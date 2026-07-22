import Link from "next/link";
import { X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";

type AuthHeaderProps = {
  showClose?: boolean;
  closeHref?: string;
  /** When null, logo is not a link (use on password-setup so session users are not bounced to /dashboard). */
  logoHref?: string | null;
};

export function AuthHeader({
  showClose = false,
  closeHref = "/login",
  logoHref = "/",
}: AuthHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-8 sm:py-6">
        <BrandLogo href={logoHref} size="md" priority />
        <div className="flex items-center gap-4 sm:gap-8">
          <Link
            href="/advocate"
            className="font-body text-sm tracking-wide text-on-surface-variant transition-colors hover:text-primary"
            prefetch={false}
          >
            Support
          </Link>
          {showClose ? (
            <Link
              href={closeHref}
              className="text-on-surface-variant transition-colors hover:text-primary"
              aria-label="Close"
              prefetch={false}
            >
              <X size={22} />
            </Link>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
