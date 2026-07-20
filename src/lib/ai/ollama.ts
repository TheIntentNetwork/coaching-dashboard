import OpenAI from "openai";

/** Expected pgvector dimension for portal_document_chunks.embedding */
export const PORTAL_EMBEDDING_DIMS = 768;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function ollamaApiKey() {
  return (
    process.env.OLLAMA_API_KEY?.trim() ||
    process.env.OLLAMA_AUTH_TOKEN?.trim() ||
    "ollama"
  );
}

/** OpenAI-compatible client for chat (Ollama Cloud by default). */
export function createOllamaClient() {
  const baseURL = (
    process.env.OLLAMA_BASE_URL?.trim() || "https://ollama.com/v1"
  ).replace(/\/$/, "");

  return new OpenAI({
    baseURL,
    apiKey: ollamaApiKey(),
  });
}

/**
 * OpenAI-compatible client for embeddings.
 * Prefer OLLAMA_EMBED_BASE_URL (e.g. EC2 Ollama) so chat can stay on cloud.
 */
export function createEmbedClient() {
  const baseURL = (
    process.env.OLLAMA_EMBED_BASE_URL?.trim() ||
    process.env.OLLAMA_BASE_URL?.trim() ||
    "http://127.0.0.1:11434/v1"
  ).replace(/\/$/, "");

  return new OpenAI({
    baseURL,
    apiKey:
      process.env.OLLAMA_EMBED_API_KEY?.trim() ||
      ollamaApiKey(),
  });
}

export function getChatModel() {
  return (
    process.env.COPILOT_CHAT_MODEL?.trim() ||
    process.env.COPILOT_AGENT_MODEL?.trim() ||
    "glm-5.2"
  );
}

export function getEmbedProvider(): "ollama" | "gemini" | "openai" {
  const raw = (process.env.COPILOT_EMBED_PROVIDER || "").toLowerCase().trim();
  if (raw === "ollama" || raw === "gemini" || raw === "openai") return raw;
  // Self-hosted Ollama (EC2) is the default when an embed base URL is set.
  if (process.env.OLLAMA_EMBED_BASE_URL?.trim()) return "ollama";
  return "gemini";
}

export function getEmbedModel() {
  const provider = getEmbedProvider();
  if (process.env.COPILOT_EMBED_MODEL?.trim()) {
    return process.env.COPILOT_EMBED_MODEL.trim();
  }
  if (provider === "openai") return "text-embedding-3-small";
  if (provider === "ollama") return "nomic-embed-text";
  return "gemini-embedding-001";
}

async function embedWithOllama(texts: string[]): Promise<number[][]> {
  const client = createEmbedClient();
  const model = getEmbedModel();
  const response = await client.embeddings.create({
    model,
    input: texts,
  });
  return response.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((row) => row.embedding);
}

async function embedWithOpenAI(texts: string[]): Promise<number[][]> {
  const apiKey = requireEnv("OPENAI_API_KEY");
  const client = new OpenAI({ apiKey });
  const response = await client.embeddings.create({
    model: getEmbedModel(),
    input: texts,
    dimensions: PORTAL_EMBEDDING_DIMS,
  });
  return response.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((row) => row.embedding);
}

async function embedWithGemini(texts: string[]): Promise<number[][]> {
  const apiKey = requireEnv("GEMINI_API_KEY");
  const model = getEmbedModel().replace(/^models\//, "");
  const vectors: number[][] = [];

  for (const text of texts) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${model}`,
        content: { parts: [{ text }] },
        outputDimensionality: PORTAL_EMBEDDING_DIMS,
      }),
    });
    const json = (await res.json()) as {
      embedding?: { values?: number[] };
      error?: { message?: string };
    };
    if (!res.ok || !json.embedding?.values) {
      throw new Error(json.error?.message || `Gemini embed failed (${res.status})`);
    }
    vectors.push(json.embedding.values);
  }

  return vectors;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const provider = getEmbedProvider();
  let vectors: number[][];

  if (provider === "openai") {
    vectors = await embedWithOpenAI(texts);
  } else if (provider === "ollama") {
    vectors = await embedWithOllama(texts);
  } else {
    vectors = await embedWithGemini(texts);
  }

  for (const vector of vectors) {
    if (vector.length !== PORTAL_EMBEDDING_DIMS) {
      throw new Error(
        `Embedding dim mismatch: got ${vector.length}, expected ${PORTAL_EMBEDDING_DIMS} (provider=${provider}, model=${getEmbedModel()}).`,
      );
    }
  }

  return vectors;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embedTexts([text]);
  return vector;
}

export async function chatCompletion(params: {
  system: string;
  user: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  temperature?: number;
}): Promise<string> {
  if (!process.env.OLLAMA_API_KEY?.trim() && !process.env.OLLAMA_AUTH_TOKEN?.trim()) {
    requireEnv("OLLAMA_API_KEY");
  }

  const client = createOllamaClient();
  const model = getChatModel();
  const history = (params.history || []).slice(-12);

  const completion = await client.chat.completions.create({
    model,
    temperature: params.temperature ?? 0.3,
    messages: [
      { role: "system", content: params.system },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: params.user },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || "";
}

export function toPgVectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}
