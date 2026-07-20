"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-shell";
import {
  useCompensatoryMutation,
  useCompensatoryQuery,
  useDeleteCompensatoryMutation,
  type CompensatoryPlan,
} from "@/lib/portal/query/hooks/use-compensatory";

type Plan = CompensatoryPlan;

const emptyForm = {
  title: "",
  summary: "",
  missed_services: "",
  timeframe_start: "",
  timeframe_end: "",
};

export function CompensatorySection() {
  const plansQuery = useCompensatoryQuery();
  const saveMutation = useCompensatoryMutation();
  const deleteMutation = useDeleteCompensatoryMutation();
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const items = plansQuery.data?.items || [];
  const loading = plansQuery.isPending && !plansQuery.data;
  const saving = saveMutation.isPending;
  const error =
    localError ||
    (plansQuery.error ? plansQuery.error.message : null) ||
    (saveMutation.error ? saveMutation.error.message : null);

  function startEdit(plan: Plan) {
    if (plan.status !== "draft") return;
    setEditingId(plan.id);
    setForm({
      title: plan.title,
      summary: plan.summary || "",
      missed_services: plan.missed_services || "",
      timeframe_start: plan.timeframe_start || "",
      timeframe_end: plan.timeframe_end || "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save(submit: boolean) {
    if (!form.title.trim()) {
      setLocalError("Title is required");
      return;
    }
    setLocalError(null);
    try {
      await saveMutation.mutateAsync({
        id: editingId,
        body: { ...form, submit },
      });
      resetForm();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function remove(id: string) {
    setLocalError(null);
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="page-pad">
      <PageHeader
        title="Compensatory service plans"
        description="Track missed or delayed services your child should receive. Submit a plan so your advocate can follow up with the district."
      />

      {error ? (
        <p className="mb-6 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      <section className="mb-10 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-on-surface-variant">
          {editingId ? "Edit draft" : "New plan"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant sm:col-span-2">
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-background px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-on-surface"
              placeholder="e.g. Missed speech minutes — Fall semester"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            From
            <input
              type="date"
              value={form.timeframe_start}
              onChange={(e) => setForm((f) => ({ ...f, timeframe_start: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-background px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-on-surface"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            To
            <input
              type="date"
              value={form.timeframe_end}
              onChange={(e) => setForm((f) => ({ ...f, timeframe_end: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-background px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-on-surface"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant sm:col-span-2">
            Missed services
            <textarea
              value={form.missed_services}
              onChange={(e) => setForm((f) => ({ ...f, missed_services: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-background px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-on-surface"
              placeholder="Speech 30 min/week × 12 weeks, OT pull-out, etc."
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant sm:col-span-2">
            Summary / context
            <textarea
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-background px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-on-surface"
              placeholder="What happened and what make-up services you are seeking"
            />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => void save(false)}
            className="inline-flex items-center gap-2 rounded-lg bg-surface-variant px-5 py-2.5 text-sm font-bold text-on-surface disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Save draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary disabled:opacity-60"
          >
            Submit to advocate
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg px-4 py-2.5 text-sm font-bold text-on-surface-variant"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </section>

      {loading ? (
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Loader2 className="animate-spin" size={18} /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="text-on-surface-variant">No compensatory plans yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((plan) => (
            <li
              key={plan.id}
              className="rounded-xl border border-outline-variant/30 bg-background p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    {plan.status.replace("_", " ")}
                  </p>
                  <h3 className="mt-1 font-headline text-xl text-on-surface">{plan.title}</h3>
                  {plan.missed_services ? (
                    <p className="mt-2 text-sm text-on-surface-variant">{plan.missed_services}</p>
                  ) : null}
                  {plan.advisor_note ? (
                    <p className="mt-3 rounded-lg bg-surface-container-low px-3 py-2 text-sm text-on-surface">
                      <span className="font-bold">Advocate note: </span>
                      {plan.advisor_note}
                    </p>
                  ) : null}
                </div>
                {plan.status === "draft" ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(plan)}
                      className="rounded-lg px-3 py-2 text-xs font-bold text-primary hover:bg-surface-variant"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(plan.id)}
                      className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-variant"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
