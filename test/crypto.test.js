import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  sha256,
  hmacSign,
  hmacVerify,
  randomSalt,
  generateSecret
} from '../src/core/crypto.js';
import { sha256Sync } from '../src/core/sha256.js';

describe('Crypto Primitives', () => {
  test('sha256 produces valid 64-character hex digest', () => {
    const hash = sha256('barstile');
    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64);
    assert.match(hash, /^[0-9a-f]{64}$/);
    assert.equal(hash, sha256('barstile')); // Deterministic
  });

  test('sha256Sync accurately hashes multi-byte UTF-8, emojis, and unicode strings', () => {
    const vectors = [
      '',
      'hello world',
      'salt_abc123:49201',
      'Barstile 🛡️ Anti-Bot Guard',
      '⚔️🐱 Paladin Cat Nonce: 999999',
      'Multi-byte: 中文 Español Français Русский 🚀🔥'
    ];

    for (const v of vectors) {
      const native = sha256(v);
      const pure = sha256Sync(v);
      assert.equal(pure, native, `Mismatch on vector: ${v}`);
    }
  });

  test('hmacSign creates repeatable signature with secret', () => {
    const secret = 'super-secret-key-12345';
    const sig1 = hmacSign('payload:data', secret);
    const sig2 = hmacSign('payload:data', secret);
    assert.equal(sig1, sig2);
    assert.equal(sig1.length, 64);
  });

  test('hmacVerify returns true for valid signature', () => {
    const secret = 'test-secret';
    const payload = 'salt123:4:1700000000';
    const sig = hmacSign(payload, secret);
    assert.equal(hmacVerify(payload, secret, sig), true);
  });

  test('hmacVerify returns false for tampered signature or payload', () => {
    const secret = 'test-secret';
    const payload = 'salt123:4:1700000000';
    const sig = hmacSign(payload, secret);

    // Tampered payload
    assert.equal(hmacVerify('salt123:1:1700000000', secret, sig), false);
    // Tampered secret
    assert.equal(hmacVerify(payload, 'wrong-secret', sig), false);
    // Tampered signature
    const corruptSig = '0' + sig.slice(1);
    assert.equal(hmacVerify(payload, secret, corruptSig), false);
    // Invalid signature types/lengths
    assert.equal(hmacVerify(payload, secret, 'short'), false);
    assert.equal(hmacVerify(payload, secret, null), false);
  });

  test('randomSalt generates unique hex strings of requested byte length', () => {
    const salt1 = randomSalt(16);
    const salt2 = randomSalt(16);
    assert.equal(salt1.length, 32); // 16 bytes = 32 hex chars
    assert.notEqual(salt1, salt2);
  });

  test('generateSecret produces 64-character secure random key', () => {
    const secret1 = generateSecret();
    const secret2 = generateSecret();
    assert.equal(secret1.length, 64);
    assert.notEqual(secret1, secret2);
  });
});
