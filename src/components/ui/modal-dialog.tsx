"use client";

import { useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type ModalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Prevent close while a mutation is running */
  busy?: boolean;
  size?: "md" | "lg";
};

export function ModalDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  busy = false,
  size = "md",
}: ModalDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"
            disabled={busy}
            onClick={() => {
              if (!busy) onOpenChange(false);
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={`relative w-full overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-bright p-6 shadow-soft ${
              size === "lg" ? "max-w-lg" : "max-w-md"
            }`}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id={titleId} className="font-headline text-2xl text-on-surface">
                  {title}
                </h2>
                {description ? (
                  <p
                    id={descriptionId}
                    className="mt-2 text-sm leading-relaxed text-on-surface-variant"
                  >
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                disabled={busy}
                aria-label="Close"
                onClick={() => onOpenChange(false)}
                className="shrink-0 rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
