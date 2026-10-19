import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createChallengeToken } from '../src/core/challenge.js';
import { solve, solveSync } from '../src/client/solver.js';
import { verifySolution } from '../src/core/verifier.js';

describe('Client Solvers', () => {
  const secret = 'client-solver-test-secret';

  test('solveSync solves difficulty 2 challenge accurately', () => {
    const token = createChallengeToken({ secret, difficulty: 2, ttlMs: 60000 });
    const result = solveSync(token);

    assert.ok(result.solution.startsWith(token));
    assert.equal(typeof result.nonce, 'number');
    assert.ok(result.hash.startsWith('00'));
    assert.ok(result.attempts > 0);

    // Verify against server
    const verification = verifySolution({ solution: result.solution, secret });
    assert.equal(verification.valid, true);
  });

  test('solve (async) solves difficulty 3 challenge non-blockingly', async () => {
    const token = createChallengeToken({ secret, difficulty: 3, ttlMs: 60000 });
    let progressCalls = 0;

    const result = await solve(token, {
      chunkSize: 500, // Small chunk to test event loop yields
      onProgress: (p) => {
        progressCalls++;
        assert.ok(p.attempts > 0);
      }
    });

    assert.ok(result.solution.startsWith(token));
    assert.ok(result.hash.startsWith('000'));

    const verification = verifySolution({ solution: result.solution, secret });
    assert.equal(verification.valid, true);
  });

  test('solve honors AbortSignal', async () => {
    const token = createChallengeToken({ secret, difficulty: 7, ttlMs: 60000 }); // Heavy difficulty
    const controller = new AbortController();

    const solvePromise = solve(token, {
      signal: controller.signal,
      chunkSize: 100
    });

    // Abort after 50ms
    setTimeout(() => controller.abort(), 50);

    await assert.rejects(solvePromise, {
      name: 'AbortError'
    });
  });

  test('solve throws on already expired tokens', async () => {
    const token = createChallengeToken({ secret, difficulty: 2, ttlMs: 1000 });
    // Wait for expiration
    await new Promise((r) => setTimeout(r, 1100));

    await assert.rejects(
      () => solve(token),
      /challenge token has already expired/
    );
  });
});
