import Link from "next/link";
import { X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";

type AuthHeaderProps = {
  showClose?: boolean;
  closeHref?: string;
};

export function AuthHeader({ showClose = false, closeHref = "/sign-in" }: AuthHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-8 sm:py-6">
        <BrandLogo href="/" size="md" priority />
        <div className="flex items-center gap-4 sm:gap-8">
          <Link
            href="/advocate"
            className="font-body text-sm tracking-wide text-on-surface-variant transition-colors hover:text-primary"
          >
            Support
          </Link>
          {showClose ? (
            <Link
              href={closeHref}
              className="text-on-surface-variant transition-colors hover:text-primary"
              aria-label="Close"
            >
              <X size={22} />
            </Link>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
