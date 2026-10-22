import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  createChallengeToken,
  parseChallengeToken,
  verifyChallengeToken
} from '../src/core/challenge.js';

describe('Challenge Tokens', () => {
  const secret = 'barstile-test-secret-32-bytes-long';

  test('createChallengeToken creates correctly formatted 4-part token', () => {
    const token = createChallengeToken({ secret, difficulty: 3, ttlMs: 30000 });
    assert.equal(typeof token, 'string');

    const parts = token.split('.');
    assert.equal(parts.length, 4);

    const [salt, diffStr, expStr, sig] = parts;
    assert.equal(salt.length, 32);
    assert.equal(diffStr, '3');
    assert.ok(Number.parseInt(expStr, 10) > Date.now());
    assert.equal(sig.length, 64);
  });

  test('createChallengeToken enforces difficulty bounds (1 to 8)', () => {
    const low = createChallengeToken({ secret, difficulty: 0 });
    assert.equal(parseChallengeToken(low).difficulty, 1);

    const high = createChallengeToken({ secret, difficulty: 99 });
    assert.equal(parseChallengeToken(high).difficulty, 8);
  });

  test('createChallengeToken throws error if secret is missing', () => {
    assert.throws(() => {
      createChallengeToken({ secret: '' });
    }, /secret must be a non-empty string/);
  });

  test('parseChallengeToken extracts components accurately', () => {
    const token = createChallengeToken({ secret, difficulty: 4, ttlMs: 60000 });
    const parsed = parseChallengeToken(token);

    assert.ok(parsed);
    assert.equal(parsed.difficulty, 4);
    assert.ok(parsed.expiresAt > Date.now());
    assert.equal(typeof parsed.salt, 'string');
    assert.equal(typeof parsed.signature, 'string');
  });

  test('parseChallengeToken returns null on malformed tokens', () => {
    assert.equal(parseChallengeToken('invalid.token'), null);
    assert.equal(parseChallengeToken('a.b.c.d'), null); // non-numeric diff/exp
    assert.equal(parseChallengeToken(''), null);
    assert.equal(parseChallengeToken(null), null);
    assert.equal(parseChallengeToken('salt.0.12345.sig'), null); // diff < 1
  });

  test('verifyChallengeToken validates legitimate token', () => {
    const token = createChallengeToken({ secret, difficulty: 4, ttlMs: 60000 });
    const result = verifyChallengeToken(token, secret);

    assert.equal(result.valid, true);
    assert.equal(result.data.difficulty, 4);
  });

  test('verifyChallengeToken rejects expired token', () => {
    const token = createChallengeToken({ secret, difficulty: 4, ttlMs: 1000 });
    const futureTime = Date.now() + 5000;
    const result = verifyChallengeToken(token, secret, futureTime);

    assert.equal(result.valid, false);
    assert.equal(result.reason, 'challenge_expired');
  });

  test('verifyChallengeToken rejects tampered token components', () => {
    const token = createChallengeToken({ secret, difficulty: 4, ttlMs: 60000 });
    const parts = token.split('.');

    // Attacker lowers difficulty to 1
    const tamperedDiff = `${parts[0]}.1.${parts[2]}.${parts[3]}`;
    assert.equal(verifyChallengeToken(tamperedDiff, secret).valid, false);

    // Attacker extends expiration
    const tamperedExp = `${parts[0]}.${parts[1]}.${Number(parts[2]) + 999999}.${parts[3]}`;
    assert.equal(verifyChallengeToken(tamperedExp, secret).valid, false);

    // Attacker alters salt (strictly different character)
    const firstChar = parts[0][0];
    const newChar = firstChar === 'a' ? 'b' : 'a';
    const tamperedSalt = `${newChar}${parts[0].slice(1)}.${parts[1]}.${parts[2]}.${parts[3]}`;
    assert.equal(verifyChallengeToken(tamperedSalt, secret).valid, false);
  });
});
