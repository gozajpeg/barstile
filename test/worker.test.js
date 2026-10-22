import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { solveWorker, isWebWorkerSupported } from '../src/client/worker.js';
import { createChallengeToken } from '../src/core/challenge.js';
import { verifySolution } from '../src/core/verifier.js';
import { barstileFetch, clearClearance } from '../src/client/fetch.js';

describe('Web Worker Solver Mode (Flaw 6)', () => {
  const secret = 'worker_test_secret_key_1234567890';

  test('isWebWorkerSupported returns false in Node environment', () => {
    assert.equal(isWebWorkerSupported(), false);
  });

  test('solveWorker falls back cleanly to main-thread solve in non-worker environments', async () => {
    const challenge = createChallengeToken({ secret, difficulty: 2 });
    const result = await solveWorker(challenge);

    assert.ok(result);
    assert.ok(result.solution.startsWith(challenge + ':'));
    assert.ok(typeof result.nonce === 'number');
    assert.ok(result.hash.startsWith('00'));
    assert.ok(result.attempts > 0);

    const verifyRes = verifySolution({ solution: result.solution, secret });
    assert.equal(verifyRes.valid, true);
  });

  test('solveWorker honors AbortSignal during solve', async () => {
    const challenge = createChallengeToken({ secret, difficulty: 5 });
    const controller = new AbortController();

    // Abort after 5ms
    setTimeout(() => controller.abort(), 5);

    await assert.rejects(
      async () => {
        await solveWorker(challenge, { signal: controller.signal });
      },
      (err) => err.name === 'AbortError'
    );
  });

  test('solveWorker throws on expired challenge token', async () => {
    const challenge = createChallengeToken({ secret, difficulty: 2, ttlMs: 1000 });
    await new Promise((r) => setTimeout(r, 1100));

    await assert.rejects(
      async () => {
        await solveWorker(challenge);
      },
      /challenge token has already expired/
    );
  });

  test('solveWorker executes via Web Worker when Worker and Blob are available', async () => {
    let workerCreated = false;
    let workerTerminated = false;
    let revokedUrl = null;

    class MockWorker extends EventEmitter {
      constructor(url) {
        super();
        this.url = url;
        workerCreated = true;
      }
      postMessage(msg) {
        // Simulate background worker solving
        setImmediate(() => {
          const pEvt = {
            data: {
              type: 'progress',
              attempts: 50,
              durationMs: 2
            }
          };
          if (typeof this.onmessage === 'function') this.onmessage(pEvt);
          this.emit('message', pEvt);

          const sEvt = {
            data: {
              type: 'success',
              solution: msg.challenge + ':42',
              nonce: 42,
              hash: '00abcd1234',
              attempts: 100,
              durationMs: 5
            }
          };
          if (typeof this.onmessage === 'function') this.onmessage(sEvt);
          this.emit('message', sEvt);
        });
      }
      terminate() {
        workerTerminated = true;
      }
    }

    // Temporarily mock browser globals
    const origWindow = globalThis.window;
    const origWorker = globalThis.Worker;
    const origBlob = globalThis.Blob;
    const origUrl = globalThis.URL;

    try {
      globalThis.window = {};
      globalThis.Worker = MockWorker;
      globalThis.Blob = class MockBlob { constructor(chunks) { this.chunks = chunks; } };
      globalThis.URL = {
        createObjectURL: () => 'blob:mock-worker-url',
        revokeObjectURL: (url) => { revokedUrl = url; }
      };

      assert.equal(isWebWorkerSupported(), true);

      let progressReceived = false;
      const challenge = createChallengeToken({ secret, difficulty: 2 });

      const result = await solveWorker(challenge, {
        onProgress: (p) => {
          if (p.attempts > 0) progressReceived = true;
        }
      });

      assert.equal(workerCreated, true, 'Web Worker should have been instantiated');
      assert.equal(result.solution, challenge + ':42');
      assert.equal(result.nonce, 42);
      assert.equal(workerTerminated, true, 'Worker should be terminated after solve');
      assert.equal(revokedUrl, 'blob:mock-worker-url', 'Blob URL should be revoked');
      assert.equal(progressReceived, true, 'Progress events should be dispatched');
    } finally {
      globalThis.window = origWindow;
      globalThis.Worker = origWorker;
      globalThis.Blob = origBlob;
      globalThis.URL = origUrl;
    }
  });

  test('solveWorker falls back cleanly when Web Worker creation throws (e.g. strict CSP)', async () => {
    class FailingWorker {
      constructor() {
        throw new Error('SecurityError: Content Security Policy directive worker-src blocks blob:');
      }
    }

    const origWindow = globalThis.window;
    const origWorker = globalThis.Worker;
    const origBlob = globalThis.Blob;
    const origUrl = globalThis.URL;

    try {
      globalThis.window = {};
      globalThis.Worker = FailingWorker;
      globalThis.Blob = class MockBlob { constructor(chunks) { this.chunks = chunks; } };
      globalThis.URL = {
        createObjectURL: () => 'blob:mock-csp-fail',
        revokeObjectURL: () => {}
      };

      const challenge = createChallengeToken({ secret, difficulty: 2 });
      // Should not throw CSP error; should seamlessly fallback to main thread solve
      const result = await solveWorker(challenge);

      assert.ok(result);
      assert.ok(result.solution.startsWith(challenge + ':'));
      assert.ok(result.hash.startsWith('00'));
    } finally {
      globalThis.window = origWindow;
      globalThis.Worker = origWorker;
      globalThis.Blob = origBlob;
      globalThis.URL = origUrl;
    }
  });

  test('barstileFetch uses solveWorker with worker: true (default) and worker: false', async () => {
    clearClearance();
    const challenge = createChallengeToken({ secret, difficulty: 1 });

    // Mock fetch implementation that returns 449 on initial probe and 200 on solved retry
    let callCount = 0;
    const mockFetch = async (url, init) => {
      callCount += 1;
      const headers = new Headers(init?.headers || {});
      const solution = headers.get('x-barstile-solution');

      if (!solution) {
        return new Response(JSON.stringify({ error: 'pow_required' }), {
          status: 449,
          headers: { 'x-barstile-challenge': challenge }
        });
      }

      return new Response(JSON.stringify({ success: true, call: callCount }), {
        status: 200,
        headers: { 'x-barstile-clearance': 'clearance.token.mock' }
      });
    };

    // 1. With worker: true (default)
    const res1 = await barstileFetch('http://example.local/api', {}, { fetchFn: mockFetch });
    assert.equal(res1.status, 200);
    const body1 = await res1.json();
    assert.equal(body1.success, true);

    // 2. With worker: false (explicit main-thread solve)
    clearClearance();
    const res2 = await barstileFetch('http://example.local/api', {}, {
      fetchFn: mockFetch,
      worker: false
    });
    assert.equal(res2.status, 200);
    const body2 = await res2.json();
    assert.equal(body2.success, true);
  });
});
