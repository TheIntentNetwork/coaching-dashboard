"use client";

import { useState } from "react";
import { Check, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { PortalPrepItem } from "@/lib/portal/types";

type PrepItemListProps = {
  title: string;
  addLabel: string;
  /** Questions show a numbered title + detail body; notes show a single body paragraph. */
  withTitle: boolean;
  items: PortalPrepItem[];
  emptyLabel: string;
  onCreate: (title: string | null, body: string) => Promise<void>;
  onUpdate: (id: string, patch: { title?: string | null; body?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function PrepItemList({
  title,
  addLabel,
  withTitle,
  items,
  emptyLabel,
  onCreate,
  onUpdate,
  onDelete,
}: PrepItemListProps) {
  const [adding, setAdding] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitAdd() {
    if (!draftBody.trim()) return;
    setBusy(true);
    await onCreate(withTitle ? draftTitle.trim() || null : null, draftBody.trim());
    setBusy(false);
    setDraftTitle("");
    setDraftBody("");
    setAdding(false);
  }

  function startEdit(item: PortalPrepItem) {
    setEditingId(item.id);
    setEditTitle(item.title || "");
    setEditBody(item.body || "");
  }

  async function submitEdit() {
    if (!editingId || !editBody.trim()) return;
    setBusy(true);
    await onUpdate(editingId, {
      title: withTitle ? editTitle.trim() || null : null,
      body: editBody.trim(),
    });
    setBusy(false);
    setEditingId(null);
  }

  return (
    <section>
      <div className="mb-8 flex items-baseline justify-between border-b border-outline-variant/30 pb-4">
        <h2 className="font-headline text-3xl text-on-surface">{title}</h2>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:text-primary/80"
        >
          <Plus size={14} />
          {addLabel}
        </button>
      </div>

      {adding ? (
        <div className="mb-8 space-y-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5">
          {withTitle ? (
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Question title"
              className="w-full border-b border-outline-variant bg-transparent py-2 font-body text-base text-on-surface outline-none focus:border-primary"
            />
          ) : null}
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder={withTitle ? "Add detail or context…" : "Write your note…"}
            rows={3}
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
        <p className="text-sm italic text-on-surface-variant">{emptyLabel}</p>
      ) : (
        <div className="space-y-8">
          {items.map((item, index) => (
            <div key={item.id} className="group flex items-start gap-6">
              {withTitle ? (
                <span className="font-headline text-2xl text-primary/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
              ) : (
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
              )}

              <div className="flex-1">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    {withTitle ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border-b border-outline-variant bg-transparent py-2 font-body text-base text-on-surface outline-none focus:border-primary"
                      />
                    ) : null}
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={3}
                      className="w-full resize-none border-b border-outline-variant bg-transparent py-2 font-body text-sm text-on-surface-variant outline-none focus:border-primary"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs font-bold uppercase text-on-surface-variant"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={submitEdit}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase text-on-primary disabled:opacity-60"
                      >
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {withTitle && item.title ? (
                      <p className="mb-1 text-lg font-medium text-on-surface">{item.title}</p>
                    ) : null}
                    <p
                      className={
                        withTitle
                          ? "text-sm italic text-on-surface-variant"
                          : "border-l-2 border-primary/20 pl-6 font-body text-lg leading-relaxed text-on-surface-variant"
                      }
                    >
                      {item.body}
                    </p>
                  </>
                )}
              </div>

              {editingId === item.id ? null : (
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container hover:text-tertiary"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
