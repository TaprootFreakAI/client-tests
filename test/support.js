import { BASE } from '../lib/http.js';

/**
 * Build a callback URL with optional query params.
 * Only appends params that are provided (omits undefined/null).
 */
export function callbackUrl(callback, { quote, method, asset } = {}) {
  const params = [];
  if (quote != null) params.push(`quote=${encodeURIComponent(quote)}`);
  if (method != null) params.push(`method=${encodeURIComponent(method)}`);
  if (asset != null) params.push(`asset=${encodeURIComponent(asset)}`);
  if (params.length === 0) return callback;
  const sep = callback.includes('?') ? '&' : '?';
  return `${callback}${sep}${params.join('&')}`;
}

/**
 * Skip when the demo link has no pending payment.
 * @returns {boolean} true if skipped
 */
export function skipIfNoPending(t, pay) {
  if (pay.status === 404 && pay.body?.message === 'No pending payment found') {
    t.skip('No pending payment on demo link');
    return true;
  }
  return false;
}

/**
 * GET/PUT/POST/DELETE JSON against BASE+path (or absolute URL).
 * Does not throw on HTTP error status; returns { status, body }.
 * @param {string} method
 * @param {string} path
 * @param {unknown} [body]
 * @returns {Promise<{ status: number, body: unknown }>}
 */
export async function jsonFetch(method, path, body) {
  const url =
    path.startsWith('http://') || path.startsWith('https://')
      ? path
      : `${BASE}${path}`;

  const init = {
    method,
    signal: AbortSignal.timeout(20_000),
  };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Request failed for ${url}: ${msg}`);
  }

  let text;
  try {
    text = await res.text();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed reading response from ${url}: ${msg}`);
  }

  let parsed = null;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Non-JSON response from ${url} (HTTP ${res.status})`);
    }
  }

  return { status: res.status, body: parsed };
}
