import type { ReactNode } from "react";

type PageWidth = "wide" | "narrow";

const WIDTH: Record<PageWidth, string> = {
  /** Dashboard, Case file, Meetings, Reports, Advocate */
  wide: "max-w-7xl",
  /** Messages, Settings — slightly tighter reading width */
  narrow: "max-w-5xl",
};

export function PageShell({
  children,
  width = "wide",
  className = "",
}: {
  children: ReactNode;
  width?: PageWidth;
  className?: string;
}) {
  return (
    <div className={`page-pad mx-auto w-full ${WIDTH[width]} ${className}`.trim()}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between ${className}`.trim()}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="page-title font-normal">{title}</h1>
        {description ? (
          <div className="page-lede mt-2 text-sm text-on-surface-variant sm:text-base">
            {description}
          </div>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
