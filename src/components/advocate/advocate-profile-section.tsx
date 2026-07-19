"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheck, Loader2, Mail, MessageCircle, Phone, UserRound } from "lucide-react";
import { useAppSession } from "@/components/auth/session-provider";
import { AdvocateBookingPanel } from "@/components/advocate/advocate-booking-panel";
import type { PortalAdvocate, PortalMeetingListItem } from "@/lib/portal/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AdvocateProfileSection() {
  const { theme, copy } = useAppSession();
  const [advocate, setAdvocate] = useState<PortalAdvocate | null>(null);
  const [meetings, setMeetings] = useState<PortalMeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [advocateRes, meetingsRes] = await Promise.all([
          fetch("/api/portal/advocate"),
          fetch("/api/portal/meetings"),
        ]);
        const advocateJson = await advocateRes.json();
        const meetingsJson = await meetingsRes.json();
        if (cancelled) return;
        if (!advocateRes.ok) setError(advocateJson.error || "Failed to load advocate");
        else setAdvocate(advocateJson.advocate ?? null);
        if (meetingsRes.ok) setMeetings(meetingsJson.meetings || []);
      } catch {
        if (!cancelled) setError("Failed to load advocate");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const roleTitle =
    advocate?.title || (theme === "iep" ? "Senior Parent Advocate" : "Certified Professional Coach");
  const firstName = advocate?.name?.split(" ")[0] || copy.coachNoun;

  const pastMeetings = meetings
    .filter((m) => m.status === "completed" || m.status === "cancelled" || m.status === "no_show")
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-16 text-on-surface-variant sm:px-6 sm:py-24 lg:px-12">
        <Loader2 className="animate-spin" size={20} />
        Loading your advocate…
      </div>
    );
  }

  return (
    <div className="page-pad mx-auto max-w-6xl">
      {error ? (
        <p className="mb-8 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      <div className="mb-10 grid grid-cols-1 items-start gap-8 sm:mb-16 sm:gap-12 lg:grid-cols-12">
        <div className="flex flex-col space-y-8 lg:col-span-7">
          {advocate ? (
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left">
              <div className="relative shrink-0">
                <div className="relative h-40 w-32 overflow-hidden rounded-xl bg-surface-container shadow-soft sm:h-64 sm:w-48">
                  {advocate.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- external, unconfigured domain
                    <img
                      src={advocate.avatarUrl}
                      alt={advocate.name}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-on-surface-variant/30">
                      <UserRound size={44} />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-3 -right-3 rounded-full bg-primary p-2.5 text-on-primary shadow-soft sm:-bottom-4 sm:-right-4 sm:p-3">
                  <BadgeCheck size={18} />
                </div>
              </div>
              <div className="flex-1 sm:pt-4">
                <span className="mb-2 block font-label text-xs font-bold uppercase tracking-widest text-primary">
                  {roleTitle}
                </span>
                <h1 className="page-title mb-3 sm:mb-4">
                  {advocate.name}
                </h1>
                {advocate.bio ? (
                  <p className="font-body text-base italic leading-relaxed text-on-surface-variant sm:text-lg">
                    &ldquo;{advocate.bio}&rdquo;
                  </p>
                ) : null}
                <p className="mt-3 font-label text-xs uppercase tracking-widest text-on-surface-variant">
                  {advocate.program || copy.programLabel}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-10 text-center">
              <UserRound className="mx-auto mb-4 text-on-surface-variant/40" size={40} />
              <h1 className="mb-2 font-headline text-3xl text-on-surface">No advocate assigned yet</h1>
              <p className="mx-auto max-w-md text-on-surface-variant">
                Complete enrollment with your advisor to get matched with your dedicated{" "}
                {copy.coachNoun}.
              </p>
              <Link
                href="/setup"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-on-primary shadow-soft"
              >
                Go to Setup
              </Link>
            </div>
          )}

          {advocate ? (
            <div className="border-t border-outline-variant/60 pt-8">
              <div className="flex flex-wrap justify-center gap-3 sm:justify-start sm:gap-4">
                {advocate.email ? (
                  <a
                    href={`mailto:${advocate.email}`}
                    className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 text-sm text-on-surface-variant transition-all hover:bg-surface-variant/30 sm:px-5"
                  >
                    <Mail size={16} />
                    <span className="max-w-[10rem] truncate sm:max-w-none">{advocate.email}</span>
                  </a>
                ) : null}
                {advocate.phone ? (
                  <a
                    href={`tel:${advocate.phone}`}
                    className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 text-sm text-on-surface-variant transition-all hover:bg-surface-variant/30 sm:px-5"
                  >
                    <Phone size={16} />
                    {advocate.phone}
                  </a>
                ) : null}
                <Link
                  href="/follow-up"
                  className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 text-sm text-on-surface-variant transition-all hover:bg-surface-variant/30 sm:px-5"
                >
                  <MessageCircle size={16} />
                  Message {firstName}
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-5">
          <AdvocateBookingPanel
            advocateName={advocate?.name ?? null}
            hasAdvocate={Boolean(advocate)}
          />
        </div>
      </div>

      <section className="border-t border-outline-variant/60 pt-10 sm:pt-16">
        <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <h2 className="mb-2 font-headline text-3xl text-on-surface sm:text-4xl">Collaboration History</h2>
            <p className="font-body text-sm text-on-surface-variant sm:text-base">
              {advocate
                ? `Past meetings with ${firstName} — summaries from your work together.`
                : "Past meetings will appear here once scheduled."}
            </p>
          </div>
          <Link
            href="/meetings"
            className="shrink-0 border-b border-primary pb-1 font-bold text-primary transition-all hover:border-b-2"
          >
            View all meetings
          </Link>
        </div>

        {pastMeetings.length === 0 ? (
          <p className="text-on-surface-variant">No past meetings yet.</p>
        ) : (
          <div className="space-y-0">
            {pastMeetings.map((meeting, index) => {
              const last = index === pastMeetings.length - 1;
              const title = meeting.appointmentType || meeting.purpose || "Meeting";
              return (
                <div key={meeting.id} className="flex">
                  <div className="mr-5 flex flex-col items-center sm:mr-8 md:mr-12">
                    <div
                      className={`mt-2 h-3 w-3 shrink-0 rounded-full ${
                        meeting.hasSummary ? "bg-primary" : "border-2 border-primary bg-background"
                      }`}
                    />
                    {!last ? <div className="my-2 w-px flex-1 bg-outline-variant/60" /> : null}
                  </div>
                  <div className="flex-1 pb-8 sm:pb-12">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-6">
                      <div>
                        <span
                          className={`mb-1 block font-label text-xs font-bold uppercase ${
                            meeting.hasSummary ? "text-primary" : "text-tertiary"
                          }`}
                        >
                          {meeting.hasSummary ? "Summary Ready" : "No Summary Yet"}
                        </span>
                        <h3 className="mb-2 font-headline text-xl text-on-surface sm:text-2xl">{title}</h3>
                        <p className="max-w-xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
                          {meeting.summary?.summary_markdown ||
                            "No summary has been added for this meeting yet."}
                        </p>
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <span className="block text-sm font-bold text-on-surface">
                          {formatDate(meeting.startTime)}
                        </span>
                        <Link
                          href={`/meetings/${meeting.id}`}
                          className="mt-2 inline-block text-sm font-bold text-primary hover:underline sm:mt-4"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
