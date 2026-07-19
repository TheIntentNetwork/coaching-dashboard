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
    return buffer.toString("utf8");
  }

  if (mime.includes("pdf") || lower.endsWith(".pdf")) {
    // pdf-parse v2 exports PDFParse class (not a callable default).
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return (result.text || "").trim();
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  // Images / binary office docs: store file but no extractable text yet
  return "";
}
