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
