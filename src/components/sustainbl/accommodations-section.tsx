"use client";

import { useMemo, useRef, useState } from "react";
import { FolderOpen, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ModalDialog } from "@/components/ui/modal-dialog";
import { PageHeader } from "@/components/layout/page-shell";
import {
  EVIDENCE_ACCEPT,
  isAllowedEvidenceFile,
} from "@/lib/portal/document-categories";
import {
  useAccommodationMutation,
  useAccommodationsQuery,
  useDeleteAccommodationMutation,
  type AccommodationItem,
} from "@/lib/portal/query/hooks/use-accommodations";
import {
  useDocumentsQuery,
  useUploadDocumentMutation,
} from "@/lib/portal/query/hooks/use-documents";

type Item = AccommodationItem;

type DocOption = { id: string; name: string; purpose: string | null };

type FormState = {
  title: string;
  description: string;
  service_kind: Item["service_kind"];
  status: Item["status"];
  document_ids: string[];
};

const emptyForm: FormState = {
  title: "",
  description: "",
  service_kind: "accommodation",
  status: "active",
  document_ids: [],
};

export function AccommodationsSection() {
  const itemsQuery = useAccommodationsQuery();
  const docsQuery = useDocumentsQuery();
  const saveMutation = useAccommodationMutation();
  const deleteMutation = useDeleteAccommodationMutation();
  const uploadMutation = useUploadDocumentMutation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const items = itemsQuery.data?.items || [];
  const allDocs: DocOption[] = useMemo(
    () => docsQuery.data?.documents || [],
    [docsQuery.data?.documents],
  );
  const linkedDocs = allDocs.filter((d) => form.document_ids.includes(d.id));
  const loading = itemsQuery.isPending && !itemsQuery.data;
  const saving = saveMutation.isPending;
  const uploading = uploadMutation.isPending;
  const error =
    localError ||
    (itemsQuery.error ? itemsQuery.error.message : null) ||
    (saveMutation.error ? saveMutation.error.message : null);

  function startEdit(item: Item) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description || "",
      service_kind: item.service_kind,
      status: item.status,
      document_ids: item.document_ids || [],
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save() {
    if (!form.title.trim()) {
      setLocalError("Title is required");
      return;
    }
    setLocalError(null);
    try {
      await saveMutation.mutateAsync({ id: editingId, body: form });
      resetForm();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Save failed");
    }
  }

  function toggleDoc(id: string) {
    setForm((prev) => ({
      ...prev,
      document_ids: prev.document_ids.includes(id)
        ? prev.document_ids.filter((d) => d !== id)
        : [...prev.document_ids, id],
    }));
  }

  function removeLinked(id: string) {
    setForm((prev) => ({
      ...prev,
      document_ids: prev.document_ids.filter((d) => d !== id),
    }));
  }

  async function uploadProof(file: File) {
    if (!isAllowedEvidenceFile(file)) {
      setLocalError("Only PDF files are accepted.");
      return;
    }
    setLocalError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("purpose", "accommodations_evidence");
      const json = await uploadMutation.mutateAsync(body);
      const id = json.document?.id as string | undefined;
      if (id) {
        setForm((prev) => ({
          ...prev,
          document_ids: prev.document_ids.includes(id)
            ? prev.document_ids
            : [...prev.document_ids, id],
        }));
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="page-pad">
      <PageHeader
        title="Accommodations & supportive services"
        description="List what your child needs in class and attach proof. New uploads go into Documents as accommodations evidence."
      />

      {error ? (
        <p className="mb-6 rounded-lg border border-tertiary/30 bg-tertiary/5 px-4 py-3 text-sm text-tertiary">
          {error}
        </p>
      ) : null}

      <section className="mb-10 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-on-surface-variant">
          {editingId ? "Edit item" : "Add item"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant sm:col-span-2">
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-background px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-on-surface"
              placeholder="e.g. Preferential seating near teacher"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Type
            <select
              value={form.service_kind}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  service_kind: e.target.value as Item["service_kind"],
                }))
              }
              className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-background px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-on-surface"
            >
              <option value="accommodation">Accommodation</option>
              <option value="supportive_service">Supportive service</option>
            </select>
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as Item["status"] }))
              }
              className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-background px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-on-surface"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant sm:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-background px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-on-surface"
              placeholder="Why this is needed and how it helps in class"
            />
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Linked proof documents
          </p>

          {linkedDocs.length > 0 ? (
            <ul className="mb-3 space-y-2">
              {linkedDocs.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2 text-sm"
                >
                  <span className="truncate text-on-surface">{d.name}</span>
                  <button
                    type="button"
                    onClick={() => removeLinked(d.id)}
                    className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-variant"
                    aria-label={`Remove ${d.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept={EVIDENCE_ACCEPT}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadProof(file);
            }}
          />

          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadProof(file);
            }}
            className={`rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-outline-variant/50 bg-background"
            }`}
          >
            <Upload size={20} className="mx-auto text-primary" />
            <p className="mt-2 text-sm font-medium text-on-surface">
              {uploading ? "Uploading proof…" : "Drag and drop a PDF here"}
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Saved to Documents as accommodations evidence
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary disabled:opacity-60"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Upload PDF
              </button>
              <button
                type="button"
                disabled={uploading || allDocs.length === 0}
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/50 px-4 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-low disabled:opacity-60"
              >
                <FolderOpen size={14} />
                Choose from Documents
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {editingId ? "Save changes" : "Add"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-variant"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </section>

      {loading ? (
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Loader2 className="animate-spin" size={18} /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="text-on-surface-variant">No accommodations listed yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-outline-variant/30 bg-background p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    {item.service_kind.replace("_", " ")} · {item.status}
                  </p>
                  <h3 className="mt-1 font-headline text-xl text-on-surface">{item.title}</h3>
                  {item.description ? (
                    <p className="mt-2 text-sm text-on-surface-variant">{item.description}</p>
                  ) : null}
                  {item.document_ids?.length ? (
                    <p className="mt-2 text-xs text-on-surface-variant">
                      {item.document_ids.length} linked document
                      {item.document_ids.length === 1 ? "" : "s"}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="rounded-lg px-3 py-2 text-xs font-bold text-primary hover:bg-surface-variant"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-variant"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ModalDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title="Choose from Documents"
        description="Select existing files to link as proof for this accommodation."
        size="lg"
      >
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {allDocs.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No documents uploaded yet.</p>
          ) : (
            allDocs.map((d) => {
              const on = form.document_ids.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDoc(d.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${
                    on
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-variant"
                  }`}
                >
                  <span className="truncate">{d.name}</span>
                  <span className="ml-2 shrink-0 text-[10px] font-bold uppercase tracking-widest opacity-80">
                    {on ? "Linked" : "Link"}
                  </span>
                </button>
              );
            })
          )}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary"
          >
            Done
          </button>
        </div>
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(next) => {
          if (!next) setDeleteId(null);
        }}
        title="Delete this accommodation?"
        description="This removes the item from your Case file. Linked documents stay in Documents."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          setLocalError(null);
          try {
            await deleteMutation.mutateAsync(deleteId);
            if (editingId === deleteId) resetForm();
            setDeleteId(null);
          } catch (err) {
            setLocalError(err instanceof Error ? err.message : "Delete failed");
            throw err;
          }
        }}
      />
    </div>
  );
}
