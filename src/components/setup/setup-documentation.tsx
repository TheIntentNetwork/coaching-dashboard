"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, FileText, Loader2, Lock, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { CoverImage } from "@/components/ui/cover-image";
import { usePortalSetup } from "@/lib/portal/client/use-portal-setup";
import { SetupWaiting } from "@/components/setup/setup-waiting";
import { getMeetingType } from "@/lib/portal/meeting-types";
import { IMAGES } from "@/lib/images";

function formatMeetingDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function SetupDocumentation() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { setup, loading, setSetup } = usePortalSetup();
  const [initialized, setInitialized] = useState(false);
  const [draftDocumentId, setDraftDocumentId] = useState<string | null>(null);
  const [draftFileName, setDraftFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && !initialized) {
    setInitialized(true);
    setDraftDocumentId(setup?.draft_document_id ?? null);
  }

  useEffect(() => {
    if (!draftDocumentId) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/documents/${draftDocumentId}`);
      const json = await res.json();
      if (!cancelled && res.ok) setDraftFileName(json.name || null);
    })();
    return () => {
      cancelled = true;
    };
  }, [draftDocumentId]);

  async function onUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("purpose", "iep_draft");
      const res = await fetch("/api/documents", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Upload failed");
        return;
      }
      if (json.warning) setError(json.warning);
      setDraftDocumentId(json.document.id);
      setDraftFileName(json.document.name);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onComplete() {
    if (!draftDocumentId) {
      setError("Upload your IEP draft before completing setup.");
      return;
    }
    setCompleting(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_document_id: draftDocumentId, submit: true }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setSetup(json.setup);
      router.push("/setup");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-on-surface-variant">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  if (
    setup?.status === "submitted" ||
    setup?.status === "under_review" ||
    setup?.status === "approved"
  ) {
    const mt = getMeetingType(setup.meeting_type);
    return (
      <SetupWaiting
        variant="scheduled"
        studentName={setup.student_name}
        meetingDateLabel={formatMeetingDate(setup.meeting_date)}
        meetingTimeLabel={setup.meeting_time}
        meetingTypeLabel={mt?.label || setup.meeting_type}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-8 sm:py-10 md:px-12 md:py-14 lg:flex-row lg:gap-14">
      <div className="flex flex-col lg:w-2/5">
        <div className="mb-6 sm:mb-8">
          <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-primary">
            Step 3 of 3
          </span>
          <h1 className="mb-4 font-display text-3xl leading-tight text-on-background sm:text-4xl md:text-5xl">
            The Documentation
          </h1>
          <p className="font-body leading-relaxed text-on-surface-variant">
            Upload your latest IEP or evaluation report to begin building your advocacy dashboard.
          </p>
        </div>
        <div className="relative mb-6 hidden aspect-square overflow-hidden rounded-2xl border border-outline-variant/40 shadow-soft lg:block">
          <CoverImage src={IMAGES.setupDocs} alt="Organized documents and folder" />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/30 to-transparent" />
        </div>
        <div className="flex items-center gap-6 text-on-surface-variant/60">
          <div className="flex items-center gap-2">
            <Lock size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Private by Design</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:w-3/5"
      >
        <div className="rounded-[2rem] border border-outline-variant/60 bg-white/40 p-5 shadow-soft backdrop-blur-sm sm:p-8 md:p-10">
          {draftFileName ? (
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-headline text-lg text-on-surface">{draftFileName}</p>
                <p className="text-xs text-on-surface-variant">Uploaded and ready</p>
              </div>
            </div>
          ) : null}

          <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low/50 p-6 text-center transition-all hover:border-primary/40 hover:bg-surface-container/60 sm:p-10">
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="application/pdf,.pdf"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUpload(file);
              }}
            />
            <div className="mb-5 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                {uploading ? <Loader2 size={28} className="animate-spin" /> : <Upload size={28} />}
              </div>
            </div>
            <h2 className="mb-2 font-headline text-2xl text-on-surface">
              {draftFileName ? "Replace IEP Draft" : "Upload IEP Draft"}
            </h2>
            <p className="mx-auto max-w-xs font-body text-sm text-on-surface-variant">
              Drag and drop your PDF, or{" "}
              <span className="font-semibold text-primary underline underline-offset-4">
                browse files
              </span>
            </p>
            <p className="mt-6 text-[10px] uppercase tracking-widest text-on-surface-variant/50">
              PDF only · Maximum 50MB
            </p>
          </label>

          {error ? <p className="mt-4 text-sm text-tertiary">{error}</p> : null}

          <div className="mt-8 space-y-5">
            {[
              {
                title: "PDF required",
                body: "Upload a PDF of your latest IEP or evaluation report for a reliable preview.",
              },
              {
                title: "Private & searchable",
                body: "Files are stored securely in SustainBL and indexed for Ask Copilot.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-outline-variant/60">
                  <Check size={12} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">{item.title}</h3>
                  <p className="mt-1 text-xs text-on-surface-variant">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col-reverse items-center justify-between gap-6 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/setup/milestone")}
              className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <button
              type="button"
              disabled={completing || uploading}
              onClick={onComplete}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-10 py-4 font-bold text-on-primary shadow-soft transition-all active:scale-95 disabled:opacity-60 sm:w-auto"
            >
              {completing ? <Loader2 size={18} className="animate-spin" /> : null}
              Complete Schedule
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
