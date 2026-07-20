import Image from "next/image";
import Link from "next/link";
import type { PortalTheme } from "@/lib/auth/service-type";

const LOGO_BY_THEME: Record<PortalTheme, string> = {
  iep: "/imgs/sustainbl-logos/Orange.png",
  coaching: "/imgs/sustainbl-logos/Original.png",
};

type BrandLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showWordmark?: boolean;
  /** Optional line under SustainBL (aligned with the wordmark, not under the icon) */
  tagline?: string;
  priority?: boolean;
  /** IEP uses Orange.png; coaching uses Original.png */
  theme?: PortalTheme;
  onClick?: () => void;
};

const SIZES = {
  sm: { width: 32, height: 32, className: "h-8 w-8" },
  md: { width: 40, height: 40, className: "h-10 w-10" },
  lg: { width: 48, height: 48, className: "h-12 w-12" },
} as const;

const WORDMARK = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
} as const;

export function BrandLogo({
  href = "/dashboard",
  size = "md",
  className = "",
  showWordmark = true,
  tagline,
  priority = false,
  theme = "coaching",
  onClick,
}: BrandLogoProps) {
  const dims = SIZES[size];
  const logoSrc = LOGO_BY_THEME[theme];

  const mark = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        src={logoSrc}
        alt=""
        width={dims.width}
        height={dims.height}
        className={`${dims.className} shrink-0 rounded-lg object-contain`}
        priority={priority}
      />
      {showWordmark ? (
        <span className="flex min-w-0 flex-col justify-center gap-0.5">
          <span
            className={`font-headline font-bold italic leading-none tracking-tight text-primary ${WORDMARK[size]}`}
          >
            SustainBL
          </span>
          {tagline ? (
            <span className="font-body text-[11px] leading-tight text-on-surface-variant/70">
              {tagline}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );

  if (!href) {
    return (
      <span className="inline-flex shrink-0" aria-label="SustainBL">
        {mark}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex shrink-0"
      aria-label="SustainBL home"
    >
      {mark}
    </Link>
  );
}
