"use client";

import { useMemo, useState } from "react";
import { Download, Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/layout/page-shell";
import { DocumentUploadDialog } from "@/components/sustainbl/document-upload-dialog";
import { useAppSession } from "@/components/auth/session-provider";
import { mimeLabel } from "@/lib/documents/mime-label";
import {
  getDocumentCategory,
  getUploadCategories,
  type DocumentCategoryId,
} from "@/lib/portal/document-categories";
import {
  useDeleteDocumentMutation,
  useDocumentsQuery,
  useUploadDocumentMutation,
  type PortalDocumentRow,
} from "@/lib/portal/query/hooks/use-documents";

type PortalDocument = PortalDocumentRow;

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
  const { copy, theme } = useAppSession();
  const docsQuery = useDocumentsQuery();
  const uploadMutation = useUploadDocumentMutation();
  const deleteMutation = useDeleteDocumentMutation();
  const [localError, setLocalError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filterPurpose, setFilterPurpose] = useState<string>("all");

  const categories = useMemo(() => getUploadCategories(), []);
  const documents = docsQuery.data?.documents || [];
  const loading = docsQuery.isPending && !docsQuery.data;
  const uploading = uploadMutation.isPending;
  const error =
    localError ||
    (docsQuery.error ? docsQuery.error.message : null) ||
    (uploadMutation.error ? uploadMutation.error.message : null) ||
    (deleteMutation.error ? deleteMutation.error.message : null);

  async function onUpload(file: File, purpose: DocumentCategoryId) {
    setLocalError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("purpose", purpose);
    const json = await uploadMutation.mutateAsync(form);
    if (json.warning) setLocalError(json.warning);
  }

  async function openDoc(id: string) {
    const res = await fetch(`/api/documents/${id}`);
    const json = await res.json();
    if (!res.ok || !json.url) {
      setLocalError(json.error || "Could not open file");
      return;
    }
    window.open(json.url, "_blank", "noopener,noreferrer");
  }

  const filtered =
    filterPurpose === "all"
      ? documents
      : documents.filter((d) => (d.purpose || "general") === filterPurpose);

  const readyCount = filtered.filter((d) => d.status === "ready").length;
  const actionCount = filtered.filter(
    (d) => d.status === "failed" || d.status === "processing" || d.status === "uploaded",
  ).length;

  return (
    <div className="page-pad">
      <PageHeader
        title="Documents"
        description={
          theme === "iep"
            ? "Upload school and medical evidence by category so your advocate can find it quickly."
            : `Uploads are stored securely in your Case file for ${copy.programLabel}.`
        }
        actions={
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-soft transition-all active:scale-95 sm:w-auto"
          >
            <Plus size={18} />
            Upload File
          </button>
        }
      />

      {error && !uploadOpen ? (
        <p className="mb-6 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterPurpose("all")}
          className={
            filterPurpose === "all"
              ? "rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-on-primary"
              : "rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-variant"
          }
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilterPurpose(c.id)}
            className={
              filterPurpose === c.id
                ? "rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-on-primary"
                : "rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-variant"
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mb-10 grid grid-cols-12 gap-4 sm:mb-16 sm:gap-6">
        <div className="col-span-12 flex flex-col gap-6 rounded-xl bg-surface-container-low p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8 md:col-span-8">
          <div className="flex gap-6 sm:gap-12">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Total Files
              </p>
              <p className="font-headline text-2xl sm:text-3xl">{filtered.length}</p>
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
        <div className="col-span-5">Document Name</div>
        <div className="col-span-2 text-center">Category</div>
        <div className="col-span-2 text-center">Type</div>
        <div className="col-span-1 text-center">Status</div>
        <div className="col-span-2 text-right">Added</div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 px-2 py-12 text-on-surface-variant sm:px-6">
          <Loader2 className="animate-spin" size={18} />
          Loading documents…
        </div>
      ) : filtered.length === 0 ? (
        <p className="px-2 py-12 text-on-surface-variant sm:px-6">
          No documents in this category yet. Upload a PDF to get started.
        </p>
      ) : (
        filtered.map((doc: PortalDocument) => {
          const tone = statusTone(doc.status);
          const toneText =
            tone === "tertiary" ? "text-tertiary" : tone === "primary" ? "text-primary" : "text-secondary";
          const toneBg =
            tone === "tertiary" ? "bg-tertiary" : tone === "primary" ? "bg-primary" : "bg-secondary";
          const categoryLabel =
            getDocumentCategory(doc.purpose)?.label || doc.purpose || "Other";
          return (
            <div
              key={doc.id}
              className="group relative border-b border-outline-variant/20 py-5 transition-colors hover:bg-surface-container sm:px-6 sm:py-8"
            >
              <div className="flex items-start gap-4 md:hidden">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-background text-primary/40">
                  <Icon name="file-text" size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-headline text-base font-medium text-on-surface">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant">{categoryLabel}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-surface-variant px-2.5 py-0.5 text-[10px] font-medium text-on-surface-variant">
                      {mimeLabel(doc.mime_type, doc.name)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${toneText}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${toneBg}`} />
                      {doc.status}
                    </span>
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

              <div className="hidden grid-cols-12 items-center md:grid">
                <div className="col-span-5 flex items-center gap-5">
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
                          : "Stored in Case file")}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 text-center text-xs font-medium text-on-surface-variant">
                  {categoryLabel}
                </div>
                <div className="col-span-2 text-center">
                  <span className="rounded-full bg-surface-variant px-3 py-1 text-xs font-medium text-on-surface-variant">
                    {mimeLabel(doc.mime_type, doc.name)}
                  </span>
                </div>
                <div className="col-span-1 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${toneText}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${toneBg}`} />
                    {doc.status}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2 text-right text-sm text-on-surface-variant">
                  <span className="mr-2 hidden lg:inline">{formatDate(doc.created_at)}</span>
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

      <DocumentUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        uploading={uploading}
        onUpload={onUpload}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(next) => {
          if (!next) setDeleteId(null);
        }}
        title="Delete this document?"
        description="This removes the file from your Case file. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          await deleteMutation.mutateAsync(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
