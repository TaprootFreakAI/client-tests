import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LINK_ID, getJson } from '../lib/http.js';

describe('LNURL siblings', () => {
  it('GET /lnurlw/{LINK_ID} is not an Open CryptoPay pay link', async () => {
    const { status, body } = await getJson(`/lnurlw/${LINK_ID}`);
    assert.ok(status === 404 || status >= 500, `unexpected status ${status}`);
    if (status === 404) {
      assert.equal(typeof body.message, 'string');
    }
  });

  it('GET /lnurld/{LINK_ID} is not an Open CryptoPay pay link', async () => {
    const { status, body } = await getJson(`/lnurld/${LINK_ID}`);
    assert.ok(status === 404 || status >= 500, `unexpected status ${status}`);
    if (status === 404) {
      assert.equal(typeof body.message, 'string');
    }
  });

  it('GET /lnurla returns validation error mentioning tag/k1/action', async () => {
    const { status, body } = await getJson('/lnurla');
    assert.equal(status, 400);
    const msg = body?.message;
    if (Array.isArray(msg)) {
      assert.ok(
        msg.some((m) => {
          const s = String(m).toLowerCase();
          return s.includes('tag') || s.includes('k1');
        }),
        'expected tag or k1 in message array',
      );
    } else {
      assert.equal(typeof msg, 'string');
      const s = msg.toLowerCase();
      assert.ok(
        s.includes('tag') || s.includes('k1') || s.includes('action'),
        'expected tag, k1, or action in message',
      );
    }
  });

  it('GET /lnurla/status returns 404 mentioning k1', async () => {
    const { status, body } = await getJson('/lnurla/status');
    assert.equal(status, 404);
    const msg = body?.message;
    if (Array.isArray(msg)) {
      assert.ok(
        msg.some((m) => String(m).toLowerCase().includes('k1')),
        'expected k1 in message array',
      );
    } else {
      assert.equal(typeof msg, 'string');
      assert.ok(msg.toLowerCase().includes('k1'), 'expected k1 in message');
    }
  });
});
