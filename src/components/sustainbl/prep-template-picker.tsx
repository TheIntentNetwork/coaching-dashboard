"use client";

import { useState } from "react";
import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PREP_TEMPLATES } from "@/lib/portal/prep-templates";

type PrepTemplatePickerProps = {
  onApply: (templateKey: string) => Promise<void>;
  busy: boolean;
};

export function PrepTemplatePicker({ onApply, busy }: PrepTemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<{
    key: string;
    label: string;
  } | null>(null);

  return (
    <div className="relative shrink-0 md:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/60 bg-surface-container-low px-4 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container disabled:opacity-60 md:w-auto md:justify-start"
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Sparkles size={16} className="text-primary" />
        )}
        Use a Template
        <ChevronDown size={14} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-outline-variant/40 bg-surface-bright p-2 shadow-soft">
          {PREP_TEMPLATES.map((tpl) => (
            <button
              key={tpl.key}
              type="button"
              onClick={() => {
                setOpen(false);
                setPendingTemplate({ key: tpl.key, label: tpl.label });
              }}
              className="block w-full rounded-lg p-3 text-left transition-colors hover:bg-surface-container-low"
            >
              <p className="text-sm font-bold text-on-surface">{tpl.label}</p>
              <p className="mt-0.5 text-xs text-on-surface-variant">{tpl.description}</p>
            </button>
          ))}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingTemplate)}
        onOpenChange={(next) => {
          if (!next) setPendingTemplate(null);
        }}
        title={pendingTemplate ? `Apply “${pendingTemplate.label}”?` : "Apply template?"}
        description="This will replace your current questions, notes, and checklist."
        confirmText="Apply template"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!pendingTemplate) return;
          await onApply(pendingTemplate.key);
          setPendingTemplate(null);
        }}
      />
    </div>
  );
}
