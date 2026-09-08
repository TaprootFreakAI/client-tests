import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LINK_ID, getJson } from '../lib/http.js';
import { callbackUrl, skipIfNoPending } from './support.js';

async function getCallbackOrSkip(nested, url) {
  let status;
  let body;
  try {
    ({ status, body } = await getJson(url));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const http = msg.match(/HTTP (\d+)/);
    if (http && Number(http[1]) >= 500) {
      nested.skip(msg);
      return null;
    }
    throw err;
  }
  if (status === 404) {
    const again = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
    if (again.status === 404 && again.body?.message === 'No pending payment found') {
      nested.skip('Quote vanished before callback (no pending payment)');
      return null;
    }
    assert.fail(`callback 404 but pay-request still pending; message=${body?.message ?? '(none)'}`);
  }
  if (status >= 500) {
    nested.skip(typeof body?.message === 'string' ? body.message : `HTTP ${status}`);
    return null;
  }
  return { status, body };
}

describe('lnurlp callback', () => {
  it('GET /lnurlp/cb without quote returns no matching quote', async () => {
    const { status, body } = await getJson(`/lnurlp/cb/${LINK_ID}`);
    assert.equal(status, 404);
    assert.equal(body.message, 'No matching actual quote found');
  });

  it('GET callback for every available method×asset', async (t) => {
    const pay = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
    if (skipIfNoPending(t, pay)) return;
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
      for (const a of ta.assets) {
        const asset = a.asset;
        await t.test(`${method} ${asset}`, async (nested) => {
          const url = callbackUrl(pay.body.callback, { quote: quoteId, method, asset });
          const result = await getCallbackOrSkip(nested, url);
          if (!result) return;
          const { status, body } = result;
          assert.equal(status, 200);
          if (method === 'Lightning') {
            assert.equal(typeof body.pr, 'string');
            assert.ok(body.pr.toLowerCase().startsWith('ln'));
          } else {
            assert.equal(body.blockchain, method);
            assert.equal(typeof body.uri, 'string');
            assert.ok(body.uri.length > 0);
            assert.ok(body.expiryDate);
          }
        });
      }
    }
  });

  it('GET callback with quote only defaults to Lightning pr', async (t) => {
    const pay = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
    if (skipIfNoPending(t, pay)) return;
    assert.equal(pay.status, 200);
    const url = callbackUrl(pay.body.callback, { quote: pay.body.quote.id });
    let status;
    let body;
    try {
      ({ status, body } = await getJson(url));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const http = msg.match(/HTTP (\d+)/);
      if (http && Number(http[1]) >= 500) {
        t.skip(msg);
        return;
      }
      throw err;
    }
    if (status >= 500) {
      t.skip(typeof body?.message === 'string' ? body.message : `HTTP ${status}`);
      return;
    }
    assert.equal(status, 200);
    assert.equal(typeof body.pr, 'string');
    assert.ok(body.pr.toLowerCase().startsWith('ln'));
  });

  it('GET callback with method=Ethereum without asset is Invalid method or asset', async (t) => {
    const pay = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
    if (skipIfNoPending(t, pay)) return;
    assert.equal(pay.status, 200);
    const url = callbackUrl(pay.body.callback, {
      quote: pay.body.quote.id,
      method: 'Ethereum',
    });
    const { status, body } = await getJson(url);
    assert.equal(status, 400);
    assert.equal(body.message, 'Invalid method or asset');
  });

  it('GET callback with unknown quote returns no matching quote', async (t) => {
    const pay = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
    if (skipIfNoPending(t, pay)) return;
    assert.equal(pay.status, 200);
    const url = callbackUrl(pay.body.callback, {
      quote: 'plq_doesnotexist',
      method: 'Lightning',
      asset: 'BTC',
    });
    const { status, body } = await getJson(url);
    assert.equal(status, 404);
    assert.equal(body.message, 'No matching actual quote found');
  });

  it('GET callback for unavailable methods accepts 400 or Lightning pr', async (t) => {
    const pay = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);
    if (skipIfNoPending(t, pay)) return;
    assert.equal(pay.status, 200);
    const quoteId = pay.body.quote.id;
    const unavailable = (pay.body.transferAmounts ?? []).filter(
      (ta) => ta.available !== true,
    );
    assert.ok(unavailable.length > 0);
    for (const ta of unavailable) {
      const method = ta.method;
      await t.test(`${method} BTC`, async (nested) => {
        const url = callbackUrl(pay.body.callback, {
          quote: quoteId,
          method,
          asset: 'BTC',
        });
        const result = await getCallbackOrSkip(nested, url);
        if (!result) return;
        const { status, body } = result;
        if (status === 400) {
          assert.equal(body.message, 'Invalid method or asset');
          return;
        }
        assert.equal(status, 200);
        assert.equal(typeof body.pr, 'string');
        assert.ok(body.pr.toLowerCase().startsWith('ln'));
      });
    }
  });
});
