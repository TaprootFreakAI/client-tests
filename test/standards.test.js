import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getJson } from '../lib/http.js';

describe('paymentLink standards', () => {
  it('GET /paymentLink/standard lists OpenCryptoPay', async () => {
    const { status, body } = await getJson('/paymentLink/standard');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.some((s) => s.id === 'OpenCryptoPay'));
  });

  it('GET /paymentLink/standard/OpenCryptoPay returns details', async () => {
    const { status, body } = await getJson('/paymentLink/standard/OpenCryptoPay');
    assert.equal(status, 200);
    assert.equal(body.id, 'OpenCryptoPay');
    assert.ok(body.label);
    assert.ok(body.description);
  });
});
