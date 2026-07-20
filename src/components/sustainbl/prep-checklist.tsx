"use client";

import { useState } from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import type { PortalPrepItem } from "@/lib/portal/types";

type PrepChecklistProps = {
  items: PortalPrepItem[];
  onCreate: (title: string | null, body: string) => Promise<void>;
  onToggle: (id: string, checked: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function PrepChecklist({ items, onCreate, onToggle, onDelete }: PrepChecklistProps) {
  const [adding, setAdding] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitAdd() {
    if (!draftTitle.trim() && !draftBody.trim()) return;
    setBusy(true);
    await onCreate(draftTitle.trim() || null, draftBody.trim() || draftTitle.trim());
    setBusy(false);
    setDraftTitle("");
    setDraftBody("");
    setAdding(false);
  }

  return (
    <section>
      <div className="mb-8 flex items-baseline justify-between border-b border-outline-variant/30 pb-4">
        <h2 className="font-headline text-3xl text-on-surface">Checklist</h2>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:text-primary/80"
        >
          <Plus size={14} />
          Add Item
        </button>
      </div>

      {adding ? (
        <div className="mb-8 space-y-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5">
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Checklist item"
            className="w-full border-b border-outline-variant bg-transparent py-2 font-body text-base text-on-surface outline-none focus:border-primary"
          />
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder="Details (optional)"
            rows={2}
            className="w-full resize-none border-b border-outline-variant bg-transparent py-2 font-body text-sm text-on-surface-variant outline-none focus:border-primary"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-xs font-bold uppercase text-on-surface-variant"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={submitAdd}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase text-on-primary disabled:opacity-60"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Save
            </button>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="text-sm italic text-on-surface-variant">No checklist items yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-surface-container-low"
            >
              <button
                type="button"
                onClick={() => onToggle(item.id, !item.checked)}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  item.checked
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant/60 text-transparent"
                }`}
                aria-label={item.checked ? "Mark as not done" : "Mark as done"}
              >
                <Check size={14} />
              </button>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    item.checked ? "text-on-surface-variant line-through" : "text-on-surface"
                  }`}
                >
                  {item.title || item.body}
                </p>
                {item.title && item.body ? (
                  <p className="mt-0.5 text-sm text-on-surface-variant">{item.body}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="rounded-lg p-2 text-on-surface-variant opacity-0 transition-opacity hover:text-tertiary group-hover:opacity-100"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
