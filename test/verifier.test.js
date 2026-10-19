import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createChallengeToken } from '../src/core/challenge.js';
import { verifySolution, parseSolution } from '../src/core/verifier.js';
import { ReplayCache } from '../src/core/replay-cache.js';
import { sha256 } from '../src/core/crypto.js';

describe('Solution Verifier', () => {
  const secret = 'test-secret-verifier-12345';

  test('parseSolution correctly parses string and object formats', () => {
    const s1 = parseSolution('token123:42');
    assert.deepEqual(s1, { token: 'token123', nonce: 42 });

    const s2 = parseSolution({ challenge: 'tokenXYZ', nonce: 999 });
    assert.deepEqual(s2, { token: 'tokenXYZ', nonce: 999 });

    assert.equal(parseSolution('malformed_no_colon'), null);
    assert.equal(parseSolution('token:not_a_number'), null);
    assert.equal(parseSolution(null), null);
  });

  test('verifies a validly solved challenge', () => {
    const replayCache = new ReplayCache({ pruneIntervalMs: 0 });
    const difficulty = 2; // Fast for testing (leading '00')
    const token = createChallengeToken({ secret, difficulty, ttlMs: 60000 });
    const [salt] = token.split('.');

    // Find valid nonce
    let nonce = 0;
    while (!sha256(`${salt}:${nonce}`).startsWith('00')) {
      nonce++;
    }

    const solution = `${token}:${nonce}`;
    const result = verifySolution({ solution, secret, replayCache });

    assert.equal(result.valid, true);
    assert.equal(result.nonce, nonce);
    assert.ok(result.hash.startsWith('00'));

    replayCache.destroy();
  });

  test('rejects replay attack with the same nonce', () => {
    const replayCache = new ReplayCache({ pruneIntervalMs: 0 });
    const difficulty = 1;
    const token = createChallengeToken({ secret, difficulty, ttlMs: 60000 });
    const [salt] = token.split('.');

    let nonce = 0;
    while (!sha256(`${salt}:${nonce}`).startsWith('0')) {
      nonce++;
    }

    const solution = `${token}:${nonce}`;

    // First attempt succeeds
    const firstAttempt = verifySolution({ solution, secret, replayCache });
    assert.equal(firstAttempt.valid, true);

    // Second attempt fails with replay_detected
    const secondAttempt = verifySolution({ solution, secret, replayCache });
    assert.equal(secondAttempt.valid, false);
    assert.equal(secondAttempt.reason, 'replay_detected');

    replayCache.destroy();
  });

  test('rejects incorrect work / wrong nonce', () => {
    const token = createChallengeToken({ secret, difficulty: 6, ttlMs: 60000 });
    const solution = `${token}:999999999`; // Highly unlikely to have 6 zeros

    const result = verifySolution({ solution, secret });
    assert.equal(result.valid, false);
    assert.equal(result.reason, 'invalid_work');
  });

  test('rejects expired challenge solution', () => {
    const token = createChallengeToken({ secret, difficulty: 1, ttlMs: 1000 });
    const futureTime = Date.now() + 5000;

    const result = verifySolution({
      solution: `${token}:0`,
      secret,
      now: futureTime
    });

    assert.equal(result.valid, false);
    assert.equal(result.reason, 'challenge_expired');
  });
});
