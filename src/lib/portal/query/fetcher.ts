export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path);
  const json = (await res.json().catch(() => ({}))) as {
    error?: string;
  } & T;
  if (!res.ok) {
    throw new ApiError(json.error || `Request failed (${res.status})`, res.status);
  }
  return json as T;
}

export async function apiSend<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json: body, headers, ...rest } = init;
  const res = await fetch(path, {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : rest.body,
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: string;
  } & T;
  if (!res.ok) {
    throw new ApiError(json.error || `Request failed (${res.status})`, res.status);
  }
  return json as T;
}
