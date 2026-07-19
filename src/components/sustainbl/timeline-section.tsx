"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { useAppSession } from "@/components/auth/session-provider";
import { usePortalSetup } from "@/lib/portal/client/use-portal-setup";
import type { PortalTimelineEvent } from "@/lib/portal/types";

const EVENT_ICON: Record<string, string> = {
  draft_uploaded: "upload",
  setup_submitted: "file-text",
  meeting_confirmed: "calendar",
  meeting_scheduled: "calendar",
  prep_updated: "edit",
};

function formatEventDate(iso: string, upcoming: boolean) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const formatted = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return upcoming ? `${formatted} (Scheduled)` : formatted;
}

export function TimelineSection() {
  const { displayName } = useAppSession();
  const { setup } = usePortalSetup();
  const [events, setEvents] = useState<PortalTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/portal/timeline");
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) setError(json.error || "Failed to load timeline");
        else setEvents(json.events || []);
      } catch {
        if (!cancelled) setError("Failed to load timeline");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const studentName = setup?.student_name || displayName;
  const lastUpdated = events[0]?.created_at
    ? new Date(events[0].created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="page-pad mx-auto max-w-5xl pb-20 sm:pb-32">
      <section className="mb-8 sm:mb-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
              {studentName}&apos;s SustainBL
            </span>
            <h1 className="page-title">Educational Timeline</h1>
          </div>
          {lastUpdated ? (
            <p className="font-label text-sm text-on-surface-variant sm:pb-1">
              Last updated: {lastUpdated}
            </p>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="mb-10 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="animate-spin" size={18} />
          Loading timeline…
        </div>
      ) : events.length === 0 ? (
        <p className="text-on-surface-variant">
          No timeline events yet. Complete your setup to start building your educational history.
        </p>
      ) : (
        <section className="relative">
          <div className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-transparent via-outline-variant to-transparent sm:left-8" />
          <div className="space-y-10 sm:space-y-16 md:space-y-24">
            {events.map((event) => {
              const isInsight = event.event_type === "meeting_confirmed" && Boolean(event.body);
              return (
                <div
                  key={event.id}
                  className={`relative flex items-start gap-4 sm:gap-8 md:gap-12 ${event.is_upcoming ? "opacity-60" : ""}`}
                >
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container sm:h-16 sm:w-16">
                    <Icon name={EVENT_ICON[event.event_type] || "file-text"} className="text-primary" size={20} />
                  </div>
                  <div className="pt-1 sm:pt-2">
                    <span
                      className={`font-label text-sm ${
                        event.is_upcoming ? "font-bold text-primary" : "text-on-surface-variant"
                      }`}
                    >
                      {formatEventDate(event.event_at, event.is_upcoming)}
                    </span>
                    <h2 className="mb-3 mt-1 font-headline text-2xl text-on-surface sm:text-3xl">{event.title}</h2>

                    {event.body && !isInsight ? (
                      <p className="max-w-2xl font-light leading-relaxed text-on-surface-variant">
                        {event.body}
                      </p>
                    ) : null}

                    {isInsight ? (
                      <div className="mt-6 flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-high p-4 shadow-soft">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Icon name="lightbulb" className="text-primary" size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                            Insight
                          </p>
                          <p className="text-sm font-semibold">{event.body}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
