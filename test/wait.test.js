import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BASE, LINK_ID, getJson } from '../lib/http.js';
import { skipIfNoPending } from './support.js';

describe('lnurlp wait', () => {
  it('GET /lnurlp/wait/pl_doesnotexist returns No pending payment found', async () => {
    const { status, body } = await getJson('/lnurlp/wait/pl_doesnotexist');
    assert.equal(status, 404);
    assert.equal(body.message, 'No pending payment found');
  });

  it('GET /lnurlp/wait/{LINK_ID} hangs when payment is pending', async (t) => {
    const pay = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
    if (skipIfNoPending(t, pay)) return;

    await assert.rejects(
      async () => {
        await fetch(`${BASE}/lnurlp/wait/${LINK_ID}`, {
          signal: AbortSignal.timeout(2000),
        });
      },
      (err) => {
        const name = err?.name ?? '';
        return (
          name === 'TimeoutError' ||
          name === 'AbortError' ||
          name.includes('Timeout') ||
          name.includes('Abort')
        );
      },
    );
  });
});
