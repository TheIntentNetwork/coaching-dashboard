"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { useAppSession } from "@/components/auth/session-provider";
import { PageHeader } from "@/components/layout/page-shell";
import { usePortalSetup } from "@/lib/portal/client/use-portal-setup";
import type { PortalPrepItem } from "@/lib/portal/types";
import { PrepItemList } from "@/components/sustainbl/prep-item-list";
import { PrepChecklist } from "@/components/sustainbl/prep-checklist";
import { PrepTemplatePicker } from "@/components/sustainbl/prep-template-picker";
import {
  useDeletePrepMutation,
  usePrepMutation,
  usePrepQuery,
} from "@/lib/portal/query/hooks/use-prep";

export function PrepSection() {
  const { displayName } = useAppSession();
  const { setup } = usePortalSetup();
  const prepQuery = usePrepQuery();
  const prepMutation = usePrepMutation();
  const deleteMutation = useDeletePrepMutation();
  const [localError, setLocalError] = useState<string | null>(null);

  const items = (prepQuery.data?.items || []) as PortalPrepItem[];
  const loading = prepQuery.isPending && !prepQuery.data;
  const busy = prepMutation.isPending || deleteMutation.isPending;
  const error =
    localError ||
    (prepQuery.error ? prepQuery.error.message : null) ||
    (prepMutation.error ? prepMutation.error.message : null);

  const questions = useMemo(() => items.filter((i) => i.item_type === "question"), [items]);
  const notes = useMemo(() => items.filter((i) => i.item_type === "note"), [items]);
  const checklist = useMemo(() => items.filter((i) => i.item_type === "checklist"), [items]);

  async function createItem(itemType: PortalPrepItem["item_type"], title: string | null, body: string) {
    setLocalError(null);
    try {
      await prepMutation.mutateAsync({
        method: "POST",
        body: { action: "create", item_type: itemType, title, body },
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to add item");
    }
  }

  async function updateItem(id: string, patch: { title?: string | null; body?: string; checked?: boolean }) {
    setLocalError(null);
    try {
      await prepMutation.mutateAsync({
        method: "PATCH",
        body: { id, ...patch },
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to update item");
    }
  }

  async function deleteItem(id: string) {
    setLocalError(null);
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to delete item");
    }
  }

  async function applyTemplate(templateKey: string) {
    setLocalError(null);
    try {
      await prepMutation.mutateAsync({
        method: "POST",
        body: { action: "apply_template", template_key: templateKey, replace: true },
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to apply template");
    }
  }

  const studentName = setup?.student_name || displayName;

  return (
    <section className="page-pad">
      <PageHeader
        title={<>{studentName}&apos;s preparation</>}
        description="Curate your thoughts and essential questions before the upcoming IEP review meeting."
        actions={<PrepTemplatePicker onApply={applyTemplate} busy={busy} />}
      />

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
        <div className="space-y-10 sm:space-y-16">
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
