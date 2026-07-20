export type DocumentCategoryId =
  | "general"
  | "iep_draft"
  | "medical"
  | "related_services"
  | "accommodations_evidence"
  | "disciplinary"
  | "attendance"
  | "grades"
  | "staff_notes"
  | "district_screenshots";

export type DocumentCategory = {
  id: DocumentCategoryId;
  label: string;
  guidance: string;
  /** optional | recommended — UI hint only */
  requiredHint: "optional" | "recommended";
  /** Hide from Documents upload picker (e.g. setup draft). */
  uploadPicker?: boolean;
};

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    id: "medical",
    label: "Medical / doctor paperwork",
    guidance: "Doctor letters, diagnoses, prescriptions, and medical evaluations.",
    requiredHint: "recommended",
    uploadPicker: true,
  },
  {
    id: "related_services",
    label: "PT / OT / speech",
    guidance: "Related services proof — physical, occupational, or speech therapy records.",
    requiredHint: "recommended",
    uploadPicker: true,
  },
  {
    id: "accommodations_evidence",
    label: "Accommodations evidence",
    guidance: "Proof your child needs classroom accommodations or supportive services.",
    requiredHint: "recommended",
    uploadPicker: true,
  },
  {
    id: "disciplinary",
    label: "Disciplinary records",
    guidance: "Office referrals, suspensions, behavior reports, or manifestation docs.",
    requiredHint: "optional",
    uploadPicker: true,
  },
  {
    id: "attendance",
    label: "Attendance",
    guidance: "Attendance reports, absences, or tardy records from the school.",
    requiredHint: "optional",
    uploadPicker: true,
  },
  {
    id: "grades",
    label: "Grades / report cards",
    guidance: "Report cards, progress reports, and grade histories.",
    requiredHint: "recommended",
    uploadPicker: true,
  },
  {
    id: "staff_notes",
    label: "Teacher / staff notes",
    guidance: "Teacher anecdotal notes, para feedback, or staff emails.",
    requiredHint: "optional",
    uploadPicker: true,
  },
  {
    id: "district_screenshots",
    label: "District app screenshots",
    guidance: "Screenshots from ClassDojo, Remind, ParentSquare, or similar apps.",
    requiredHint: "optional",
    uploadPicker: true,
  },
  {
    id: "general",
    label: "Other",
    guidance: "Anything else that helps your advocate understand the situation.",
    requiredHint: "optional",
    uploadPicker: true,
  },
  {
    id: "iep_draft",
    label: "IEP draft",
    guidance: "Draft IEP uploaded during Set Schedule.",
    requiredHint: "recommended",
    uploadPicker: false,
  },
];

const BY_ID = new Map(DOCUMENT_CATEGORIES.map((c) => [c.id, c]));

export function isDocumentCategoryId(value: string): value is DocumentCategoryId {
  return BY_ID.has(value as DocumentCategoryId);
}

export function getDocumentCategory(id: string | null | undefined): DocumentCategory | null {
  if (!id) return null;
  return BY_ID.get(id as DocumentCategoryId) ?? null;
}

export function getUploadCategories(): DocumentCategory[] {
  return DOCUMENT_CATEGORIES.filter((c) => c.uploadPicker !== false);
}

/** Categories commonly linked as proof for accommodations. */
export const ACCOMMODATION_PROOF_PURPOSES: DocumentCategoryId[] = [
  "medical",
  "related_services",
  "accommodations_evidence",
];

/** Documents Case file upload — PDF only (screenshots can be saved/exported as PDF). */
export const EVIDENCE_ACCEPT = "application/pdf,.pdf";

export function isAllowedEvidenceFile(file: { type: string; name: string }): boolean {
  const name = file.name.toLowerCase();
  const mime = (file.type || "").toLowerCase();
  return mime === "application/pdf" || name.endsWith(".pdf");
}
