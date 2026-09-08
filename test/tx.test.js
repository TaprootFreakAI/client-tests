import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LINK_ID, getJson } from '../lib/http.js';
import { skipIfNoPending } from './support.js';

describe('lnurlp tx', () => {
  it('GET /lnurlp/tx without quote returns Quote parameter missing', async () => {
    const { status, body } = await getJson(`/lnurlp/tx/${LINK_ID}`);
    assert.equal(status, 400);
    assert.equal(body.message, 'Quote parameter missing');
  });

  it('GET /lnurlp/tx with quote and method but no hex/tx/sender', async (t) => {
    const pay = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
    if (skipIfNoPending(t, pay)) return;
    assert.equal(pay.status, 200);
    const quoteId = pay.body.quote.id;
    const { status, body } = await getJson(
      `/lnurlp/tx/${LINK_ID}?quote=${encodeURIComponent(quoteId)}&method=Ethereum`,
    );
    assert.equal(status, 400);
    assert.equal(body.message, 'Hex, Tx or Sender parameter missing');
  });
});
