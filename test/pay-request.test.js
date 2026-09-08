import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BASE, LINK_ID, getJson } from '../lib/http.js';

describe('lnurlp pay request', () => {
  it(`GET /lnurlp/${LINK_ID} returns pay request or no pending payment`, async () => {
    const { status, body } = await getJson(`/lnurlp/${LINK_ID}?timeout=0`);

    if (status === 200) {
      assert.equal(body.standard, 'OpenCryptoPay');
      assert.equal(body.id, LINK_ID);
      assert.equal(body.tag, 'payRequest');
      assert.equal(body.callback, `${BASE}/lnurlp/cb/${LINK_ID}`);
      assert.equal(typeof body.quote.id, 'string');
      assert.ok(body.quote.id.startsWith('plq_'));
      assert.equal(typeof body.quote.payment, 'string');
      assert.ok(body.quote.payment.startsWith('plp_'));
      assert.ok(Number.isFinite(Date.parse(body.quote.expiration)));
      assert.ok(Date.parse(body.quote.expiration) > Date.now());
      assert.equal(typeof body.requestedAmount.asset, 'string');
      assert.ok(body.requestedAmount.asset.length > 0);
      assert.equal(typeof body.requestedAmount.amount, 'number');
      assert.ok(body.requestedAmount.amount > 0);
      assert.ok(Array.isArray(body.transferAmounts));
      assert.ok(body.transferAmounts.length > 0);
      assert.ok(Array.isArray(body.possibleStandards));
      assert.ok(body.possibleStandards.includes('OpenCryptoPay'));
      assert.equal(typeof body.displayName, 'string');
      assert.ok(body.displayName.length > 0);
      assert.equal(typeof body.displayQr, 'boolean');
      assert.equal(typeof body.mode, 'string');
      assert.equal(typeof body.minSendable, 'number');
      assert.equal(typeof body.maxSendable, 'number');
      assert.equal(typeof body.recipient, 'object');
      assert.ok(body.recipient !== null);
      assert.equal(typeof body.recipient.name, 'string');
      for (const t of body.transferAmounts) {
        assert.equal(typeof t.method, 'string');
        assert.equal(typeof t.available, 'boolean');
        assert.ok(Array.isArray(t.assets));
        if (t.available === true) {
          assert.ok(t.assets.length > 0);
          for (const asset of t.assets) {
            assert.equal(typeof asset.asset, 'string');
            assert.ok(asset.amount != null);
          }
        } else {
          assert.equal(t.assets.length, 0);
        }
      }
      assert.ok(body.transferAmounts.some((t) => t.method === 'Lightning'));
      assert.ok(body.transferAmounts.some((t) => t.method === 'Ethereum'));
      return;
    }

    if (status === 404 && body?.message === 'No pending payment found') {
      assert.equal(body.id, LINK_ID);
      assert.equal(body.standard, 'OpenCryptoPay');
      return;
    }

    assert.fail(
      `Unexpected status ${status} message=${body?.message ?? '(none)'}`,
    );
  });

  it('GET /lnurlp/pl_doesnotexist returns Payment link not found', async () => {
    const { status, body } = await getJson('/lnurlp/pl_doesnotexist?timeout=0');
    assert.equal(status, 404);
    assert.equal(body.message, 'Payment link not found');
  });
});
