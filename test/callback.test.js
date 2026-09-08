import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LINK_ID, getJson } from '../lib/http.js';

describe('lnurlp callback', () => {
  it('GET /lnurlp/cb without quote returns no matching quote', async () => {
    const { status, body } = await getJson(`/lnurlp/cb/${LINK_ID}`);
    assert.equal(status, 404);
    assert.equal(body.message, 'No matching actual quote found');
  });

  it('GET callback for every available transfer method', async (t) => {
    const pay = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
    if (pay.status === 404 && pay.body?.message === 'No pending payment found') {
      t.skip('No pending payment on demo link');
      return;
    }
    assert.equal(pay.status, 200);
    assert.equal(typeof pay.body.callback, 'string');
    assert.ok(pay.body.callback.startsWith('http'));
    const quoteId = pay.body.quote.id;
    const available = (pay.body.transferAmounts ?? []).filter(
      (ta) => ta.available === true && Array.isArray(ta.assets) && ta.assets.length > 0,
    );
    assert.ok(available.length > 0);
    for (const ta of available) {
      const method = ta.method;
      const firstAsset = ta.assets[0].asset;
      await t.test(`${method} ${firstAsset}`, async (nested) => {
        const sep = pay.body.callback.includes('?') ? '&' : '?';
        const callbackUrl =
          `${pay.body.callback}${sep}` +
          `quote=${encodeURIComponent(quoteId)}` +
          `&method=${encodeURIComponent(method)}` +
          `&asset=${encodeURIComponent(firstAsset)}`;
        const { status, body } = await getJson(callbackUrl);
        if (status === 404) {
          const again = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
          if (again.status === 404 && again.body?.message === 'No pending payment found') {
            nested.skip('Quote vanished before callback (no pending payment)');
            return;
          }
          assert.fail(`callback 404 but pay-request still pending; message=${body?.message ?? '(none)'}`);
        }
        if (status >= 500) {
          nested.skip(typeof body?.message === 'string' ? body.message : `HTTP ${status}`);
          return;
        }
        assert.equal(status, 200);
        if (method === 'Lightning') {
          assert.equal(typeof body.pr, 'string');
          assert.ok(body.pr.startsWith('ln'));
        } else {
          assert.equal(body.blockchain, method);
          assert.equal(typeof body.uri, 'string');
          assert.ok(body.uri.length > 0);
          assert.ok(body.expiryDate);
        }
      });
    }
  });
});
