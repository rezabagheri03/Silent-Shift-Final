/**
 * Tiny typed fetch wrapper for the browser.
 * All API responses look like { ok: true, data } or { ok: false, error }.
 */

export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

export async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const headers = new Headers(init?.headers);
  let body: BodyInit | undefined = init?.body as BodyInit | undefined;
  if (init?.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }
  const res = await fetch(path, { ...init, headers, body, cache: "no-store" });
  const json = (await res.json().catch(() => ({ ok: false, error: "بدنه پاسخ نامعتبر است" }))) as ApiResponse<T>;
  if (!json.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json.data;
}

export const apiGet = <T>(path: string, init?: RequestInit) => api<T>(path, init);
export const apiPost = <T>(path: string, json?: unknown) => api<T>(path, { method: "POST", json });
export const apiPut = <T>(path: string, json?: unknown) => api<T>(path, { method: "PUT", json });
export const apiDelete = <T>(path: string) => api<T>(path, { method: "DELETE" });
