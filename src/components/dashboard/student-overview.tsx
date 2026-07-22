"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useDashboardData } from "@/lib/portal/client/use-dashboard-data";

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </dt>
      <dd className="mt-1 font-headline text-lg leading-snug text-on-surface">{value}</dd>
    </div>
  );
}

function NarrativeRow({
  label,
  value,
  italic,
}: {
  label: string;
  value: string;
  italic?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,2fr)] sm:items-start sm:gap-6">
      <p className="text-sm font-bold text-primary">{label}</p>
      <span className="hidden h-full w-px bg-outline-variant/60 sm:block" aria-hidden />
      <p
        className={`text-sm leading-relaxed text-on-surface whitespace-pre-wrap ${italic ? "italic" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

export function StudentOverview() {
  const { data, loading, error } = useDashboardData();
  const profile = data?.iepProfile;

  if (loading) {
    return (
      <section className="py-2">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Loader2 className="animate-spin" size={16} />
          Loading student overview…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-2">
        <p className="text-sm text-tertiary">{error}</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="py-2">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
          Student overview
        </h2>
        <p className="text-sm text-on-surface-variant">
          Student details from intake will appear here after enrollment sync.
        </p>
      </section>
    );
  }

  const hasNarrative = Boolean(
    profile.currentChallenges ||
      profile.iepGoals ||
      profile.accommodationsNeeded ||
      profile.parentConcerns ||
      profile.additionalInfo,
  );

  return (
    <section className="space-y-8 py-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
            Student overview
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Prefilled from your IEP intake so meetings start with full context.
          </p>
        </div>
        <Link
          href="/case-file/accommodations"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:opacity-80"
        >
          Review accommodations
          <ArrowRight size={14} />
        </Link>
      </div>

      <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Student name" value={profile.childName || data?.studentName} />
        <Field label="Age range" value={profile.childAge} />
        <Field label="Grade level" value={profile.gradeLevel} />
        <Field label="School district" value={profile.schoolDistrict} />
        <Field label="Current IEP status" value={profile.currentIepStatus} />
        <Field label="Primary disability" value={profile.primaryDisability} />
        <Field label="Secondary conditions" value={profile.secondaryDisabilities} />
        <Field label="Current services" value={profile.servicesReceived} />
        <Field label="Behavioral concerns" value={profile.behavioralConcerns} />
      </dl>

      {hasNarrative ? (
        <div className="space-y-6 border-t border-outline-variant/40 pt-8">
          {profile.currentChallenges ? (
            <NarrativeRow label="Biggest school challenges" value={profile.currentChallenges} />
          ) : null}
          {profile.iepGoals ? (
            <NarrativeRow label="IEP goals" value={profile.iepGoals} />
          ) : null}
          {profile.accommodationsNeeded ? (
            <NarrativeRow label="Accommodations" value={profile.accommodationsNeeded} />
          ) : null}
          {profile.parentConcerns ? (
            <NarrativeRow label="Parent concerns" value={profile.parentConcerns} />
          ) : null}
          {profile.additionalInfo ? (
            <NarrativeRow
              label="Additional context"
              value={profile.additionalInfo}
              italic
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
