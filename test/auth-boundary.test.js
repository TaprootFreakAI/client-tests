import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getJson } from '../lib/http.js';

describe('unauthenticated paymentLink routes', () => {
  it('GET /paymentLink returns Unauthorized', async () => {
    const { status, body } = await getJson('/paymentLink');
    assert.equal(status, 401);
    assert.equal(body.message, 'Unauthorized');
  });

  it('GET /paymentLink/config returns Unauthorized', async () => {
    const { status, body } = await getJson('/paymentLink/config');
    assert.equal(status, 401);
    assert.equal(body.message, 'Unauthorized');
  });

  it('GET /paymentLink/history returns Forbidden resource', async () => {
    const { status, body } = await getJson('/paymentLink/history');
    assert.equal(status, 403);
    assert.equal(body.message, 'Forbidden resource');
  });

  it('GET /paymentLink/locations returns a JSON array', async () => {
    const { status, body } = await getJson('/paymentLink/locations');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body));
  });
});
