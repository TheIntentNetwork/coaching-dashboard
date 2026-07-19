import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  chatCompletion,
  embedQuery,
  getChatModel,
  toPgVectorLiteral,
} from "@/lib/ai/ollama";

type ChatMessage = { role: "user" | "assistant"; content: string };

type MatchedChunk = {
  document_id: string;
  content: string;
  similarity: number;
};

/**
 * Ask Copilot with RAG over the user's SustainBL document chunks (pgvector).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { message?: string; history?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = String(body.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string",
        )
        .slice(-12)
    : [];

  let sourcesUsed = 0;
  let contextBlock = "";

  try {
    const queryEmbedding = await embedQuery(message);
    const { data: matches, error: matchError } = await supabase.rpc(
      "match_portal_chunks",
      {
        query_embedding: toPgVectorLiteral(queryEmbedding),
        match_count: 8,
        p_user_id: user.id,
      },
    );

    if (matchError) {
      console.error("[copilot/chat] match_portal_chunks:", matchError.message);
    } else if (Array.isArray(matches) && matches.length > 0) {
      const chunks = (matches as MatchedChunk[]).filter(
        (c) => Number(c.similarity) >= 0.2,
      );
      sourcesUsed = chunks.length;
      contextBlock = chunks
        .map(
          (c, i) =>
            `[Excerpt ${i + 1} | similarity ${Number(c.similarity).toFixed(3)}]\n${c.content}`,
        )
        .join("\n\n");
    }
  } catch (err) {
    console.error(
      "[copilot/chat] embed/retrieve failed:",
      err instanceof Error ? err.message : err,
    );
  }

  const system = [
    "You are SustainBL Copilot, a helpful assistant for IEP parents and coaching clients.",
    "Give clear, practical guidance. Do not invent citations or claim legal/medical advice.",
    "When document excerpts are provided, ground your answer in them and say when something is not in the documents.",
    "If no excerpts are available, answer from general knowledge and the conversation, and mention that no matching document excerpts were found.",
    "Be concise and clear.",
    contextBlock
      ? `\nRelevant excerpts from the user's SustainBL documents:\n\n${contextBlock}`
      : "\nNo matching document excerpts were retrieved for this question.",
  ].join("\n");

  try {
    const reply = await chatCompletion({
      system,
      user: message,
      history,
    });
    return NextResponse.json({
      reply,
      model: getChatModel(),
      sourcesUsed,
      mode: sourcesUsed > 0 ? "document_rag" : "general_chat",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Chat failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
