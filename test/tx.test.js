import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LINK_ID, getJson } from '../lib/http.js';

describe('lnurlp tx', () => {
  it('GET /lnurlp/tx without quote returns Quote parameter missing', async () => {
    const { status, body } = await getJson(`/lnurlp/tx/${LINK_ID}`);
    assert.equal(status, 400);
    assert.equal(body.message, 'Quote parameter missing');
  });
});
