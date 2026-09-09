import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BASE, LINK_ID, getJson } from '../lib/http.js';

const ROUTE = process.env.OCP_ROUTE ?? 'DFX VM 01';

async function createInvoice(message) {
  const { status, body } = await getJson(
    `/paymentLink/payment?route=${encodeURIComponent(ROUTE)}` +
      `&amount=0.01&message=${encodeURIComponent(message)}`,
  );
  assert.equal(status, 200);
  assert.equal(body.standard, 'OpenCryptoPay');
  assert.equal(body.requestedAmount.amount, 0.01);
  assert.equal(typeof body.id, 'string');
  assert.ok(body.id.startsWith('pl_'));
  return { id: body.id, body };
}

async function cancelInvoice(id) {
  if (!id || id === LINK_ID || id === 'pl_beeddb41cd4b6d9e') {
    throw new Error(`refusing to cancel demo link id: ${id}`);
  }
  const res = await fetch(`${BASE}/lnurlp/cancel/${id}`, {
    method: 'DELETE',
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  assert.ok(text.length > 0);
  const body = JSON.parse(text);
  assert.equal(res.status, 200);
  assert.equal(body.status, 'Cancelled');
}

describe('public invoice create, cancel, wait', () => {
  it('GET /paymentLink/payment with no query returns 400 validation array', async () => {
    const { status, body } = await getJson('/paymentLink/payment');
    assert.equal(status, 400);
    assert.ok(Array.isArray(body.message));
  });

  it('GET /paymentLink/payment with route only requires amount or message', async () => {
    const { status, body } = await getJson(
      `/paymentLink/payment?route=${encodeURIComponent(ROUTE)}`,
    );
    assert.equal(status, 400);
    assert.ok(Array.isArray(body.message));
    assert.ok(
      body.message.some((m) => {
        const s = String(m).toLowerCase();
        return s.includes('amount') || s.includes('message');
      }),
      'expected amount or message in validation array',
    );
  });

  it('creates invoice, pending wait aborts, cancel then wait is 404', async () => {
    const message = `ocp-tests-${Date.now()}`;
    let id;
    try {
      const created = await createInvoice(message);
      id = created.id;

      const pending = await getJson(`/lnurlp/${id}?timeout=0`);
      assert.equal(pending.status, 200);
      assert.equal(pending.body.standard, 'OpenCryptoPay');

      await assert.rejects(
        async () => {
          await fetch(`${BASE}/lnurlp/wait/${id}`, {
            signal: AbortSignal.timeout(2000),
          });
        },
        (err) => {
          const name = err?.name ?? '';
          return (
            name === 'TimeoutError' ||
            name === 'AbortError' ||
            name.includes('Timeout') ||
            name.includes('Abort')
          );
        },
      );
    } finally {
      if (id) await cancelInvoice(id);
    }

    if (id) {
      const { status, body } = await getJson(`/lnurlp/wait/${id}`);
      assert.equal(status, 404);
      assert.equal(body.message, 'No pending payment found');
    }
  });

  it('GET /plp compact create then cancel', async () => {
    const m = `ocp-plp-${Date.now()}`;
    let id;
    try {
      const { status, body } = await getJson(
        `${BASE}/plp?r=${encodeURIComponent(ROUTE)}&a=0.01&m=${encodeURIComponent(m)}`,
      );
      assert.equal(status, 200);
      id = body.id;
      assert.equal(typeof body.id, 'string');
      assert.ok(body.id.startsWith('pl_'));
      assert.equal(body.standard, 'OpenCryptoPay');
      assert.equal(body.requestedAmount.amount, 0.01);
    } finally {
      if (id) await cancelInvoice(id);
    }
  });

  it('GET /plp with no query returns 400 validation array', async () => {
    const { status, body } = await getJson(`${BASE}/plp`);
    assert.equal(status, 400);
    assert.ok(Array.isArray(body.message));
  });
});
