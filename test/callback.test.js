import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LINK_ID, getJson } from '../lib/http.js';

describe('lnurlp callback', () => {
  it('GET /lnurlp/cb without quote returns no matching quote', async () => {
    const { status, body } = await getJson(`/lnurlp/cb/${LINK_ID}`);
    assert.equal(status, 404);
    assert.equal(body.message, 'No matching actual quote found');
  });

  it('GET callback with Lightning returns lnbc invoice when quote available', async (t) => {
    const pay = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
    if (pay.status === 404 && pay.body?.message === 'No pending payment found') {
      t.skip('No pending payment on demo link');
      return;
    }
    assert.equal(pay.status, 200);
    const quoteId = pay.body.quote.id;

    const { status, body } = await getJson(
      `/lnurlp/cb/${LINK_ID}?quote=${encodeURIComponent(quoteId)}&method=Lightning&asset=BTC`,
    );
    if (status === 404) {
      const again = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
      if (again.status === 404 && again.body?.message === 'No pending payment found') {
        t.skip('Quote vanished before callback (no pending payment)');
        return;
      }
    }
    assert.equal(status, 200);
    assert.equal(typeof body.pr, 'string');
    assert.ok(body.pr.startsWith('lnbc'));
  });

  it('GET callback with Ethereum returns ethereum URI when quote available', async (t) => {
    const pay = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
    if (pay.status === 404 && pay.body?.message === 'No pending payment found') {
      t.skip('No pending payment on demo link');
      return;
    }
    assert.equal(pay.status, 200);
    const quoteId = pay.body.quote.id;

    const { status, body } = await getJson(
      `/lnurlp/cb/${LINK_ID}?quote=${encodeURIComponent(quoteId)}&method=Ethereum&asset=ZCHF`,
    );
    if (status === 404) {
      const again = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
      if (again.status === 404 && again.body?.message === 'No pending payment found') {
        t.skip('Quote vanished before callback (no pending payment)');
        return;
      }
    }
    assert.equal(status, 200);
    assert.equal(body.blockchain, 'Ethereum');
    assert.equal(typeof body.uri, 'string');
    assert.ok(body.uri.startsWith('ethereum:'));
    assert.ok(body.expiryDate);
  });
});
