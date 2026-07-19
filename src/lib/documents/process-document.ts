/**
 * Document → chunk → embed → pgvector pipeline.
 * Called from `src/app/api/documents/route.ts` after upload.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { chunkText } from "@/lib/documents/chunk-text";
import { extractTextFromFile } from "@/lib/documents/extract-text";
import {
  embedTexts,
  getEmbedModel,
  toPgVectorLiteral,
} from "@/lib/ai/ollama";

const BUCKET = "portal-documents";

export async function processPortalDocument(documentId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: doc, error: docError } = await admin
    .from("portal_documents")
    .select("id, user_id, storage_path, mime_type, name, status")
    .eq("id", documentId)
    .maybeSingle();

  if (docError || !doc) {
    throw new Error(docError?.message || "Document not found");
  }

  await admin
    .from("portal_documents")
    .update({ status: "processing", error_message: null, updated_at: new Date().toISOString() })
    .eq("id", documentId);

  try {
    const { data: file, error: downloadError } = await admin.storage
      .from(BUCKET)
      .download(doc.storage_path);

    if (downloadError || !file) {
      throw new Error(downloadError?.message || "Failed to download file");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromFile(buffer, doc.mime_type || "", doc.name);

    if (!text.trim()) {
      await admin
        .from("portal_documents")
        .update({
          status: "ready",
          error_message: "Stored, but no extractable text for search yet.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);
      return;
    }

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      await admin
        .from("portal_documents")
        .update({
          status: "ready",
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);
      return;
    }

    // Embed in small batches to avoid oversized requests
    const batchSize = 8;
    const embeddings: number[][] = [];
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const vectors = await embedTexts(batch);
      embeddings.push(...vectors);
    }

    await admin.from("portal_document_chunks").delete().eq("document_id", documentId);

    const embedModel = getEmbedModel();
    const rows = chunks.map((content, chunk_index) => ({
      document_id: documentId,
      user_id: doc.user_id,
      chunk_index,
      content,
      embedding: toPgVectorLiteral(embeddings[chunk_index]),
      embedding_model: embedModel,
    }));

    // supabase-js accepts vector as string literal for pgvector
    const { error: insertError } = await admin
      .from("portal_document_chunks")
      .insert(rows);

    if (insertError) {
      throw new Error(insertError.message);
    }

    await admin
      .from("portal_documents")
      .update({
        status: "ready",
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    await admin
      .from("portal_documents")
      .update({
        status: "failed",
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);
    throw err;
  }
}
