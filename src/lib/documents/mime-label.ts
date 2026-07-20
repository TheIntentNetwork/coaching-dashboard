/** Friendly labels for common document MIME types. */
export function mimeLabel(mime: string | null | undefined, fileName?: string | null): string {
  const name = (fileName || "").toLowerCase();
  if (name.endsWith(".pdf") || mime === "application/pdf") return "PDF";
  if (name.endsWith(".docx") || mime?.includes("wordprocessingml")) return "DOCX";
  if (name.endsWith(".doc") || mime === "application/msword") return "DOC";
  if (mime?.startsWith("image/")) return "Image";
  if (mime?.startsWith("text/")) return "Text";
  if (!mime) return "File";
  const subtype = mime.split("/")[1] || mime;
  if (subtype.length > 18) return "Document";
  return subtype.toUpperCase();
}
