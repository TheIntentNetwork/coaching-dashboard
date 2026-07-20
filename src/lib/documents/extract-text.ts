/** Strip lone surrogates / control junk that can break JSON or embedding APIs. */
function sanitizeExtractedText(text: string): string {
  return text
    .replace(/\\u(?![0-9a-fA-F]{4})/g, "")
    .replace(/[\uD800-\uDFFF]/g, "")
    .replace(/\u0000/g, "")
    .trim();
}

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  const lower = fileName.toLowerCase();
  const mime = (mimeType || "").toLowerCase();

  if (
    mime.includes("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    lower.endsWith(".csv")
  ) {
    return sanitizeExtractedText(buffer.toString("utf8"));
  }

  if (mime.includes("pdf") || lower.endsWith(".pdf")) {
    // pdf-parse v2 exports PDFParse class (not a callable default).
    // Some PDFs (e.g. complex Unicode / Arabic) throw — treat as no text.
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const result = await parser.getText();
        return sanitizeExtractedText(result.text || "");
      } finally {
        await parser.destroy().catch(() => undefined);
      }
    } catch {
      return "";
    }
  }

  // Images / binary office docs: store file but no extractable text yet
  return "";
}
