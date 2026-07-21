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
      <dd className="mt-1 text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
        {value}
      </dd>
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
      <section className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-5">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
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
    <section className="space-y-5 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5 sm:p-6">
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

      <dl className="grid gap-4 sm:grid-cols-2">
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
        <dl className="grid gap-4 border-t border-outline-variant/30 pt-5">
          <Field label="Biggest school challenges" value={profile.currentChallenges} />
          <Field label="IEP goals" value={profile.iepGoals} />
          <Field label="Accommodations / modifications" value={profile.accommodationsNeeded} />
          <Field label="Parent concerns" value={profile.parentConcerns} />
          <Field label="Additional context" value={profile.additionalInfo} />
        </dl>
      ) : null}
    </section>
  );
}
