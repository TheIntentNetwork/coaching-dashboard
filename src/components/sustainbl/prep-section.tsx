"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { useAppSession } from "@/components/auth/session-provider";
import { usePortalSetup } from "@/lib/portal/client/use-portal-setup";
import type { PortalPrepItem } from "@/lib/portal/types";
import { PrepItemList } from "@/components/sustainbl/prep-item-list";
import { PrepChecklist } from "@/components/sustainbl/prep-checklist";
import { PrepTemplatePicker } from "@/components/sustainbl/prep-template-picker";

export function PrepSection() {
  const { displayName } = useAppSession();
  const { setup } = usePortalSetup();
  const [items, setItems] = useState<PortalPrepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/prep");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load prep kit");
        return;
      }
      setItems(json.items || []);
    } catch {
      setError("Failed to load prep kit");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const questions = useMemo(() => items.filter((i) => i.item_type === "question"), [items]);
  const notes = useMemo(() => items.filter((i) => i.item_type === "note"), [items]);
  const checklist = useMemo(() => items.filter((i) => i.item_type === "checklist"), [items]);

  async function createItem(itemType: PortalPrepItem["item_type"], title: string | null, body: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", item_type: itemType, title, body }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to add item");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function updateItem(id: string, patch: { title?: string | null; body?: string; checked?: boolean }) {
    setError(null);
    const res = await fetch("/api/portal/prep", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to update item");
      return;
    }
    await load();
  }

  async function deleteItem(id: string) {
    setError(null);
    const res = await fetch(`/api/portal/prep?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to delete item");
      return;
    }
    await load();
  }

  async function applyTemplate(templateKey: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply_template", template_key: templateKey, replace: true }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to apply template");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  const studentName = setup?.student_name || displayName;

  return (
    <section className="page-pad mx-auto w-full max-w-6xl">
      <div className="mb-8 flex flex-col gap-6 sm:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-2 block font-body text-sm font-bold uppercase tracking-widest text-primary">
            Step 03
          </span>
          <h1 className="page-title mb-3 sm:mb-4">
            {studentName}&apos;s SustainBL: Preparation
          </h1>
          <p className="max-w-xl text-base text-on-surface-variant sm:text-lg">
            Curate your thoughts and essential questions before the upcoming IEP review meeting.
          </p>
        </div>
        <PrepTemplatePicker onApply={applyTemplate} busy={busy} />
      </div>

      {error ? (
        <p className="mb-8 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="animate-spin" size={18} />
          Loading prep kit…
        </div>
      ) : (
        <div className="max-w-3xl space-y-10 sm:space-y-16">
          <PrepItemList
            title="Questions to Ask"
            addLabel="Add Question"
            withTitle
            items={questions}
            emptyLabel="No questions yet. Add one or apply a template above."
            onCreate={(title, body) => createItem("question", title, body)}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />

          <PrepItemList
            title="Parent Notes"
            addLabel="Add Note"
            withTitle={false}
            items={notes}
            emptyLabel="No notes yet."
            onCreate={(title, body) => createItem("note", title, body)}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />

          <PrepChecklist
            items={checklist}
            onCreate={(title, body) => createItem("checklist", title, body)}
            onToggle={(id, checked) => updateItem(id, { checked })}
            onDelete={deleteItem}
          />

          <section className="border-t border-outline-variant/20 pt-12">
            <div className="max-w-xl">
              <Icon name="lightbulb" className="mb-4 block text-primary" size={24} />
              <p className="mb-4 font-headline text-2xl italic leading-snug text-on-surface">
                &ldquo;The best meeting prep is the one that gives you a voice when emotions run
                high.&rdquo;
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Advocate Insight
              </p>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
