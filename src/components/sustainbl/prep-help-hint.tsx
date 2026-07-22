"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function PrepHelpHint() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hintId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/50 bg-surface-container-low text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        aria-expanded={open}
        aria-controls={hintId}
        aria-label="How meeting prep works"
      >
        <HelpCircle size={18} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={hintId}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-outline-variant/40 bg-surface-bright p-4 shadow-soft sm:w-80"
          >
            <p className="text-sm font-bold text-on-surface">How this helps in your meeting</p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Add questions and notes here before the session. During your IEP meeting, use this
              list as your guide — these are the points you will want to raise with your advocate.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
