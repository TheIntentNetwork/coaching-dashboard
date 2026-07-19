"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppSession } from "@/components/auth/session-provider";

type PortalDocument = {
  id: string;
  name: string;
  mime_type: string | null;
  status: string;
  error_message: string | null;
  byte_size: number | null;
  created_at: string;
  updated_at: string;
};

function statusTone(status: string): "tertiary" | "secondary" | "primary" {
  if (status === "failed") return "tertiary";
  if (status === "ready") return "secondary";
  return "primary";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function DocumentsSection() {
  const { displayName, copy } = useAppSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/documents");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to load documents");
      setDocuments([]);
      return;
    }
    setDocuments(json.documents || []);
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

  async function onUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/documents", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Upload failed");
      } else if (json.warning) {
        setError(json.warning);
      }
      await load();
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function openDoc(id: string) {
    const res = await fetch(`/api/documents/${id}`);
    const json = await res.json();
    if (!res.ok || !json.url) {
      setError(json.error || "Could not open file");
      return;
    }
    window.open(json.url, "_blank", "noopener,noreferrer");
  }

  async function removeDoc(id: string) {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Delete failed");
      throw new Error(json.error || "Delete failed");
    }
    await load();
  }

  const readyCount = documents.filter((d) => d.status === "ready").length;
  const actionCount = documents.filter(
    (d) => d.status === "failed" || d.status === "processing" || d.status === "uploaded",
  ).length;

  return (
    <div className="page-pad">
      <div className="mb-8 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant/60">
            <span>{displayName}&apos;s SustainBL</span>
            <Icon name="chevron" size={12} />
            <span className="text-primary/80">Documents</span>
          </nav>
          <h1 className="page-title font-normal">SustainBL Documents</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Uploads are stored securely in SustainBL for {copy.programLabel}.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.doc,.docx,application/pdf,text/plain"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file);
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-soft transition-all active:scale-95 disabled:opacity-60 sm:w-auto"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {uploading ? "Uploading…" : "Upload File"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mb-6 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      <div className="mb-10 grid grid-cols-12 gap-4 sm:mb-16 sm:gap-6">
        <div className="col-span-12 flex flex-col gap-6 rounded-xl bg-surface-container-low p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8 md:col-span-8">
          <div className="flex gap-6 sm:gap-12">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Total Files
              </p>
              <p className="font-headline text-2xl sm:text-3xl">{documents.length}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Ready
              </p>
              <p className="font-headline text-2xl text-primary sm:text-3xl">{readyCount}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Processing / Issues
              </p>
              <p className="font-headline text-2xl text-tertiary sm:text-3xl">{actionCount}</p>
            </div>
          </div>
        </div>
        <div className="relative col-span-12 overflow-hidden rounded-xl bg-primary-container p-5 sm:p-8 md:col-span-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-on-primary-container/80">
            Ask Copilot
          </p>
          <p className="font-headline text-xl leading-tight text-on-primary-container sm:text-2xl">
            Uploads are indexed so Ask Copilot can use them in answers.
          </p>
        </div>
      </div>

      <div className="hidden grid-cols-12 border-b border-outline-variant/30 px-6 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 md:grid">
        <div className="col-span-6">Document Name</div>
        <div className="col-span-2 text-center">Type</div>
        <div className="col-span-2 text-center">Status</div>
        <div className="col-span-2 text-right">Added</div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 px-2 py-12 text-on-surface-variant sm:px-6">
          <Loader2 className="animate-spin" size={18} />
          Loading documents…
        </div>
      ) : documents.length === 0 ? (
        <p className="px-2 py-12 text-on-surface-variant sm:px-6">
          No documents yet. Upload a PDF or text file to get started.
        </p>
      ) : (
        documents.map((doc) => {
          const tone = statusTone(doc.status);
          const toneText =
            tone === "tertiary" ? "text-tertiary" : tone === "primary" ? "text-primary" : "text-secondary";
          const toneBg =
            tone === "tertiary" ? "bg-tertiary" : tone === "primary" ? "bg-primary" : "bg-secondary";
          return (
            <div
              key={doc.id}
              className="group relative border-b border-outline-variant/20 py-5 transition-colors hover:bg-surface-container sm:px-6 sm:py-8"
            >
              {/* Mobile card layout */}
              <div className="flex items-start gap-4 md:hidden">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-background text-primary/40">
                  <Icon name="file-text" size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-headline text-base font-medium text-on-surface">
                    {doc.name}
                  </h3>
                  <p className="truncate text-xs font-light italic text-on-surface-variant">
                    {doc.error_message ||
                      (doc.byte_size
                        ? `${Math.max(1, Math.round(doc.byte_size / 1024))} KB`
                        : "Stored in SustainBL")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-surface-variant px-2.5 py-0.5 text-[10px] font-medium text-on-surface-variant">
                      {doc.mime_type?.split("/").pop() || "file"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${toneText}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${toneBg}`} />
                      {doc.status}
                    </span>
                    <span className="text-[10px] text-on-surface-variant/70">{formatDate(doc.created_at)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void openDoc(doc.id)}
                    className="rounded-lg p-2 hover:bg-surface-variant"
                    aria-label="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(doc.id)}
                    className="rounded-lg p-2 hover:bg-surface-variant"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Desktop table layout */}
              <div className="hidden grid-cols-12 items-center md:grid">
                <div className="col-span-6 flex items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-background text-primary/40 transition-colors group-hover:text-primary">
                    <Icon name="file-text" size={28} />
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-medium text-on-surface transition-colors group-hover:text-primary">
                      {doc.name}
                    </h3>
                    <p className="text-sm font-light italic text-on-surface-variant">
                      {doc.error_message ||
                        (doc.byte_size
                          ? `${Math.max(1, Math.round(doc.byte_size / 1024))} KB`
                          : "Stored in SustainBL")}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <span className="rounded-full bg-surface-variant px-3 py-1 text-xs font-medium text-on-surface-variant">
                    {doc.mime_type?.split("/").pop() || "file"}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${toneText}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${toneBg}`} />
                    {doc.status}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2 text-right text-sm text-on-surface-variant">
                  <span className="mr-2 hidden md:inline">{formatDate(doc.created_at)}</span>
                  <button
                    type="button"
                    onClick={() => void openDoc(doc.id)}
                    className="rounded-lg p-2 hover:bg-surface-variant"
                    aria-label="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void openDoc(doc.id)}
                    className="rounded-lg p-2 hover:bg-surface-variant"
                    aria-label="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(doc.id)}
                    className="rounded-lg p-2 hover:bg-surface-variant"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(next) => {
          if (!next) setDeleteId(null);
        }}
        title="Delete this document?"
        description="This removes the file from SustainBL. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          await removeDoc(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
