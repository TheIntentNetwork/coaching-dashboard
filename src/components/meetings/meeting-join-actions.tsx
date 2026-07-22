"use client";

import Link from "next/link";
import { Bot, ExternalLink, Video } from "lucide-react";
import { thirdPartyProviderLabel } from "@/lib/portal/third-party-meeting";

type MeetingJoinActionsProps = {
  copilotJoinUrl?: string | null;
  thirdPartyJoinUrl?: string | null;
  thirdPartyLabel?: "zoom" | "meet" | "other" | null;
  /** In-portal meeting page when Copilot URL not ready yet */
  meetingDetailHref?: string | null;
  layout?: "stack" | "row";
  size?: "md" | "sm";
  disabled?: boolean;
};

export function MeetingJoinActions({
  copilotJoinUrl,
  thirdPartyJoinUrl,
  thirdPartyLabel,
  meetingDetailHref,
  layout = "stack",
  size = "md",
  disabled = false,
}: MeetingJoinActionsProps) {
  const hasCopilot = Boolean(copilotJoinUrl);
  const hasThirdParty = Boolean(thirdPartyJoinUrl);
  const canUseDetailFallback = Boolean(meetingDetailHref) && !hasCopilot && !hasThirdParty;

  if (!hasCopilot && !hasThirdParty && !canUseDetailFallback) {
    return (
      <p className="text-sm text-on-surface-variant">
        Join links are being prepared. Refresh in a moment.
      </p>
    );
  }

  const pad = size === "sm" ? "px-4 py-2 text-xs" : "px-6 py-3.5 text-sm";
  const row = layout === "row";

  return (
    <div className={`flex flex-col gap-2 ${row ? "sm:flex-row sm:flex-wrap sm:items-center" : ""}`}>
      {hasCopilot ? (
        <a
          href={copilotJoinUrl!}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={disabled}
          className={`inline-flex items-center justify-center gap-2 rounded-xl bg-primary font-bold text-on-primary shadow-soft transition-colors hover:bg-primary-container hover:text-on-primary-container ${pad} ${disabled ? "pointer-events-none opacity-50" : ""}`}
        >
          <Bot size={size === "sm" ? 16 : 18} />
          Join with Copilot
          <ExternalLink size={14} className="opacity-70" />
        </a>
      ) : meetingDetailHref ? (
        <Link
          href={meetingDetailHref}
          className={`inline-flex items-center justify-center gap-2 rounded-xl bg-primary font-bold text-on-primary shadow-soft transition-colors hover:bg-primary-container hover:text-on-primary-container ${pad}`}
        >
          <Bot size={size === "sm" ? 16 : 18} />
          Join with Copilot
        </Link>
      ) : null}

      {hasThirdParty ? (
        <a
          href={thirdPartyJoinUrl!}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={disabled}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/60 bg-surface-container-lowest font-bold text-on-surface transition-colors hover:border-primary/40 hover:bg-surface-container-low ${pad} ${disabled ? "pointer-events-none opacity-50" : ""}`}
        >
          <Video size={size === "sm" ? 16 : 18} />
          Join via {thirdPartyProviderLabel(thirdPartyLabel || "other")}
          <ExternalLink size={14} className="opacity-60" />
        </a>
      ) : null}
    </div>
  );
}
