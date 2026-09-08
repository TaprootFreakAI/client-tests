import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getJson } from '../lib/http.js';

describe('paymentLink recipient', () => {
  it('GET /paymentLink/recipient?id=DFX%20VM%2001', async () => {
    const { status, body } = await getJson('/paymentLink/recipient?id=DFX%20VM%2001');
    assert.equal(status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.currency.name, 'CHF');
  });

  it('GET /paymentLink/recipient without id returns Payment route not found', async () => {
    const { status, body } = await getJson('/paymentLink/recipient');
    assert.equal(status, 404);
    assert.equal(body.message, 'Payment route not found');
  });

  it('GET /paymentLink/recipient with unknown id returns Payment route not found', async () => {
    const { status, body } = await getJson(
      '/paymentLink/recipient?id=not-a-real-recipient-xyz',
    );
    assert.equal(status, 404);
    assert.equal(body.message, 'Payment route not found');
  });
});
