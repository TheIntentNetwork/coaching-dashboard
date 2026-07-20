"use client";

import { useState } from "react";
import { Check, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/layout/page-shell";
import type { JourneyFlags, JourneyMilestone } from "@/lib/portal/iep-journey-defaults";
import { useJourneyMutation, useJourneyQuery } from "@/lib/portal/query/hooks/use-journey";

export function JourneySection() {
  const journeyQuery = useJourneyQuery();
  const journeyMutation = useJourneyMutation();
  const [customLabel, setCustomLabel] = useState("");
  const [customGuidance, setCustomGuidance] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const milestones = journeyQuery.data?.journey?.milestones || [];
  const flags = journeyQuery.data?.journey?.flags || {
    review_ard: false,
    mdard: false,
    staar_failure: false,
  };
  const loading = journeyQuery.isPending && !journeyQuery.data;
  const saving = journeyMutation.isPending;
  const error = journeyQuery.error?.message || journeyMutation.error?.message || null;

  function persist(nextMilestones: JourneyMilestone[], nextFlags: JourneyFlags) {
    journeyMutation.mutate({ milestones: nextMilestones, flags: nextFlags });
  }

  function toggleMilestone(id: string) {
    const next = milestones.map((m) => {
      if (m.id !== id) return m;
      const done = !m.done;
      return {
        ...m,
        done,
        completed_at: done ? new Date().toISOString() : null,
      };
    });
    persist(next, flags);
  }

  function toggleFlag(key: keyof JourneyFlags) {
    const next = { ...flags, [key]: !flags[key] };
    persist(milestones, next);
  }

  function addCustom() {
    const label = customLabel.trim();
    if (!label) return;
    const item: JourneyMilestone = {
      id: `custom_${crypto.randomUUID()}`,
      label,
      guidance: customGuidance.trim(),
      done: false,
      completed_at: null,
      custom: true,
    };
    persist([...milestones, item], flags);
    setCustomLabel("");
    setCustomGuidance("");
  }

  function moveItem(fromId: string, toId: string) {
    if (fromId === toId) return;
    const fromIndex = milestones.findIndex((m) => m.id === fromId);
    const toIndex = milestones.findIndex((m) => m.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...milestones];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    persist(next, flags);
  }

  return (
    <div className="page-pad">
      <PageHeader
        title="IEP process journey"
        description={
          <>
            A shared map of where you are in the special education process. Defaults cover the
            federal path — add custom steps or reorder if your case needs it.
            {saving ? " Saving…" : null}
          </>
        }
      />

      {error ? (
        <p className="mb-6 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Loader2 className="animate-spin" size={18} /> Loading…
        </div>
      ) : (
        <>
          <ul className="mb-8 space-y-3">
            {milestones.map((m) => (
              <li
                key={m.id}
                draggable
                onDragStart={() => setDragId(m.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) moveItem(dragId, m.id);
                  setDragId(null);
                }}
                className={`flex items-stretch gap-2 rounded-xl border border-outline-variant/30 bg-background ${
                  dragId === m.id ? "opacity-60" : ""
                }`}
              >
                <span
                  className="flex cursor-grab items-center px-2 text-on-surface-variant active:cursor-grabbing"
                  aria-label="Drag to reorder"
                  title="Drag to reorder"
                >
                  <GripVertical size={18} />
                </span>
                <button
                  type="button"
                  onClick={() => toggleMilestone(m.id)}
                  className="flex min-w-0 flex-1 items-start gap-4 py-4 pr-2 text-left hover:bg-surface-container-low"
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      m.done
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant/60"
                    }`}
                  >
                    {m.done ? <Check size={14} /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-headline text-lg text-on-surface">
                      {m.label}
                      {m.custom ? (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                          Custom
                        </span>
                      ) : null}
                    </span>
                    {m.guidance ? (
                      <span className="mt-1 block text-sm text-on-surface-variant">
                        {m.guidance}
                      </span>
                    ) : null}
                  </span>
                </button>
                {m.custom ? (
                  <button
                    type="button"
                    onClick={() => setDeleteId(m.id)}
                    className="m-2 self-center rounded-lg p-2 text-on-surface-variant hover:bg-surface-variant"
                    aria-label="Delete custom step"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>

          <section className="mb-12 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-on-surface-variant">
              Add custom step
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant sm:col-span-2">
                Title
                <input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-background px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-on-surface"
                  placeholder="e.g. Independent educational evaluation"
                />
              </label>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant sm:col-span-2">
                Short note (optional)
                <input
                  value={customGuidance}
                  onChange={(e) => setCustomGuidance(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-background px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-on-surface"
                  placeholder="Why this step matters for your case"
                />
              </label>
            </div>
            <button
              type="button"
              disabled={!customLabel.trim() || saving}
              onClick={addCustom}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary disabled:opacity-60"
            >
              <Plus size={16} />
              Add step
            </button>
          </section>

          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-on-surface-variant">
            Situation flags
          </h2>
          <p className="mb-3 max-w-xl text-sm text-on-surface-variant">
            Common special situations that change meeting prep. Toggle if they apply.
          </p>
          <div className="flex flex-wrap gap-3">
            {(
              [
                ["review_ard", "Review ARD"],
                ["mdard", "MDARD"],
                ["staar_failure", "STAAR-failure review"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleFlag(key)}
                className={
                  flags[key]
                    ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary"
                    : "rounded-full bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface-variant"
                }
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(next) => {
          if (!next) setDeleteId(null);
        }}
        title="Delete this custom step?"
        description="Default journey steps stay. Only this custom checklist item is removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          persist(
            milestones.filter((m) => m.id !== deleteId),
            flags,
          );
          setDeleteId(null);
        }}
      />
    </div>
  );
}
