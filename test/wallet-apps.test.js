import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getJson } from '../lib/http.js';

describe('paymentLink wallet apps', () => {
  it('GET /paymentLink/walletApp returns apps with methods', async () => {
    const { status, body } = await getJson('/paymentLink/walletApp');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    for (const item of body) {
      assert.ok(item.id);
      assert.ok(item.name);
      assert.ok(Array.isArray(item.supportedMethods));
    }
  });

  it('GET /paymentLink/walletApp/recommended returns recommended apps', async () => {
    const { status, body } = await getJson('/paymentLink/walletApp/recommended');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    for (const item of body) {
      assert.equal(item.recommended, true);
    }
  });

  it('GET /paymentLink/walletApp/:id returns the first recommended app', async () => {
    const { status, body } = await getJson('/paymentLink/walletApp/recommended');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    const id = body[0].id;
    const detail = await getJson(`/paymentLink/walletApp/${encodeURIComponent(id)}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.id, id);
    assert.equal(typeof detail.body.name, 'string');
    assert.ok(detail.body.name.length > 0);
    assert.ok(Array.isArray(detail.body.supportedMethods));
  });
});
