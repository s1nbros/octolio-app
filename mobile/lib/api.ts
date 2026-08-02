import { API_BASE_URL } from './config';

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, data: any) {
    super(data?.error || `Request failed (${status})`);
    this.status = status;
    this.data = data;
  }
}

/** How long any single request may run before we give up. Without this a request
 *  to an unreachable host (e.g. a stale LAN-IP EXPO_PUBLIC_API_URL) hangs forever,
 *  which strands the boot screen on an endless spinner. */
const REQUEST_TIMEOUT_MS = 15000;

/** Thin fetch wrapper around the shared Octolio backend. */
export async function api<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = opts;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e: any) {
    // Abort → timeout; anything else → network/DNS failure. Surface a clear error
    // instead of hanging, so callers (and the boot gate) can recover.
    const msg = e?.name === 'AbortError'
      ? `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s (${API_BASE_URL})`
      : `Network request failed (${API_BASE_URL})`;
    throw new ApiError(0, { error: msg });
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }

  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}
