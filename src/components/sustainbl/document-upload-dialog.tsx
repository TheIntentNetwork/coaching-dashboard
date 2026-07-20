"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { ModalDialog } from "@/components/ui/modal-dialog";
import {
  EVIDENCE_ACCEPT,
  getDocumentCategory,
  getUploadCategories,
  isAllowedEvidenceFile,
  type DocumentCategoryId,
} from "@/lib/portal/document-categories";

type DocumentUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploading: boolean;
  onUpload: (file: File, purpose: DocumentCategoryId) => Promise<void>;
};

export function DocumentUploadDialog({
  open,
  onOpenChange,
  uploading,
  onUpload,
}: DocumentUploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const categories = getUploadCategories();
  const [uploadPurpose, setUploadPurpose] = useState<DocumentCategoryId>("general");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const selectedCategory = getDocumentCategory(uploadPurpose);

  function reset() {
    setPendingFile(null);
    setDragOver(false);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function selectFile(file: File | null | undefined) {
    if (!file) return;
    if (!isAllowedEvidenceFile(file)) {
      setLocalError("Only PDF files are accepted.");
      setPendingFile(null);
      return;
    }
    setLocalError(null);
    setPendingFile(file);
  }

  async function submit() {
    if (!pendingFile) {
      setLocalError("Choose a PDF file to upload.");
      return;
    }
    setLocalError(null);
    try {
      await onUpload(pendingFile, uploadPurpose);
      onOpenChange(false);
      reset();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <ModalDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !uploading) {
          onOpenChange(false);
          reset();
        }
      }}
      title="Upload document"
      description="Choose a category, then add a PDF. The dialog closes when upload succeeds."
      busy={uploading}
      size="lg"
    >
      <div className="space-y-4">
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Category
          <select
            value={uploadPurpose}
            onChange={(e) => setUploadPurpose(e.target.value as DocumentCategoryId)}
            disabled={uploading}
            className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-background px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-on-surface"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        {selectedCategory ? (
          <div className="rounded-lg bg-surface-container-low px-3 py-3 text-sm text-on-surface-variant">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {selectedCategory.requiredHint}
            </p>
            <p className="mt-1 leading-relaxed">{selectedCategory.guidance}</p>
          </div>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={EVIDENCE_ACCEPT}
          onChange={(e) => selectFile(e.target.files?.[0])}
        />

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onClick={() => inputRef.current?.click()}
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
            selectFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-outline-variant/50 bg-background hover:border-primary/50"
          }`}
        >
          <Upload size={22} className="text-primary" />
          <p className="text-sm font-medium text-on-surface">
            {pendingFile ? pendingFile.name : "Drag and drop a PDF here"}
          </p>
          <p className="text-xs text-on-surface-variant">
            {pendingFile ? "Click to choose a different file" : "or click to choose a file"}
          </p>
        </div>

        {localError ? (
          <p className="text-sm text-tertiary" role="alert">
            {localError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={uploading}
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
            className="rounded-lg border border-outline-variant/60 px-5 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-low disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={uploading || !pendingFile}
            onClick={() => void submit()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary disabled:opacity-60"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </ModalDialog>
  );
}
