import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BASE } from '../lib/http.js';

describe('paymentLink assign', () => {
  it('PUT /paymentLink/assign with empty body requires publicName', async () => {
    const res = await fetch(`${BASE}/paymentLink/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(20_000),
    });
    assert.equal(res.status, 400);

    const text = await res.text();
    assert.ok(text.length > 0);
    const body = JSON.parse(text);
    assert.ok(Array.isArray(body.message));
    assert.ok(
      body.message.some((m) => String(m).toLowerCase().includes('publicname')),
      'expected publicName validation in message array',
    );
  });
});
