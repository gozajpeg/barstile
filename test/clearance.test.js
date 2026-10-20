import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createClearanceToken, verifyClearanceToken } from '../src/core/clearance.js';

describe('Clearance Tokens', () => {
  const secret = 'test-secret-clearance-key-12345';

  test('creates valid 4-part clearance token with salt', () => {
    const token = createClearanceToken({ secret, ttlMs: 60000 });
    assert.equal(typeof token, 'string');
    const parts = token.split('.');
    assert.equal(parts.length, 4);

    const [salt, issuedAt, expiresAt, sig] = parts;
    assert.ok(salt.length > 0);
    assert.ok(Number(issuedAt) > 0);
    assert.ok(Number(expiresAt) > Number(issuedAt));
    assert.equal(sig.length, 64);
  });

  test('validates authentic, non-expired clearance token', () => {
    const token = createClearanceToken({ secret, ttlMs: 60000 });
    const result = verifyClearanceToken(token, secret);
    assert.equal(result.valid, true);
    assert.ok(result.expiresAt > Date.now());
  });

  test('rejects expired clearance token', () => {
    const token = createClearanceToken({ secret, ttlMs: 1000 });
    const futureTime = Date.now() + 5000;
    const result = verifyClearanceToken(token, secret, futureTime);
    assert.equal(result.valid, false);
    assert.equal(result.reason, 'clearance_expired');
  });

  test('rejects tampered clearance token expiration', () => {
    const token = createClearanceToken({ secret, ttlMs: 10000 });
    const [salt, issuedAt, expiresAt, sig] = token.split('.');
    const tampered = `${salt}.${issuedAt}.${Number(expiresAt) + 1000000}.${sig}`;

    const result = verifyClearanceToken(tampered, secret);
    assert.equal(result.valid, false);
    assert.equal(result.reason, 'invalid_clearance_signature');
  });

  test('rejects token signed with different secret', () => {
    const token = createClearanceToken({ secret: 'other-secret-123', ttlMs: 60000 });
    const result = verifyClearanceToken(token, secret);
    assert.equal(result.valid, false);
    assert.equal(result.reason, 'invalid_clearance_signature');
  });
});
