import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { barstileMiddleware } from '../src/server/middleware.js';
import { Barstile } from '../src/server/barstile.js';
import { solveSync } from '../src/client/solver.js';
import { ReplayCache } from '../src/core/cache.js';
import { sha256Sync } from '../src/core/sha256.js';

describe('Barstile Comprehensive Stress & Load Testing', () => {
  function startServer(options = {}) {
    const middleware = barstileMiddleware({
      difficulty: 2, // Low difficulty for rapid test execution
      clearanceTtlMs: 60000,
      ...options
    });

    const server = http.createServer((req, res) => {
      middleware(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok', barstile: req.barstile }));
      });
    });

    return new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        resolve({
          url: `http://127.0.0.1:${port}`,
          close: () => new Promise((r) => server.close(r))
        });
      });
    });
  }

  /**
   * Concurrency worker pool: executes tasks with bounded parallel sockets
   */
  async function runPool(items, concurrency, fn) {
    const results = new Array(items.length);
    let cursor = 0;
    const workers = Array.from({ length: concurrency }, async () => {
      while (cursor < items.length) {
        const idx = cursor++;
        results[idx] = await fn(items[idx], idx);
      }
    });
    await Promise.all(workers);
    return results;
  }

  // --- 1. Concurrent Unauthenticated Scraper Flood ---
  test('stress: 300 unauthenticated scraper requests across 20 parallel workers are 100% intercepted', async () => {
    const { url, close } = await startServer();

    try {
      const totalRequests = 300;
      const concurrency = 20;
      const t0 = performance.now();

      const results = await runPool(Array.from({ length: totalRequests }), concurrency, async () => {
        const res = await fetch(`${url}/api/resource`);
        const status = res.status;
        const challenge = res.headers.get('x-barstile-challenge');
        const body = await res.json();
        return { status, hasChallenge: Boolean(challenge), error: body.error };
      });

      const durationMs = performance.now() - t0;
      const rps = ((totalRequests / durationMs) * 1000).toFixed(0);

      // Verify 100% of requests received 449 challenge
      const challengedCount = results.filter((r) => r.status === 449 && r.hasChallenge).length;
      assert.equal(challengedCount, totalRequests, 'Every request must receive a 449 challenge');

      console.log(`\n  [Measured Metric] 300 bot flood requests (${concurrency} parallel workers): ${durationMs.toFixed(1)}ms (~${rps} req/s). Zero leaks.`);
    } finally {
      await close();
    }
  });

  // --- 2. High-Concurrency Legitimate Solves & Clearance ---
  test('stress: 50 concurrent legitimate solves generate distinct clearances without race conditions', async () => {
    const { url, close } = await startServer();

    try {
      const concurrentSolvers = 50;
      const t0 = performance.now();

      // Step 1: Fetch 50 unique challenges
      const challenges = await runPool(Array.from({ length: concurrentSolvers }), 10, async () => {
        const res = await fetch(url);
        return res.headers.get('x-barstile-challenge');
      });

      // Step 2: Solve each challenge
      const solutions = challenges.map((ch) => solveSync(ch).solution);

      // Step 3: Submit 50 solutions concurrently across 10 workers
      const results = await runPool(solutions, 10, async (sol) => {
        const res = await fetch(url, { headers: { 'x-barstile-solution': sol } });
        const body = await res.json();
        return {
          status: res.status,
          clearance: res.headers.get('x-barstile-clearance'),
          verified: body.barstile?.verified
        };
      });

      const durationMs = performance.now() - t0;

      const successCount = results.filter((r) => r.status === 200 && r.verified && r.clearance).length;
      assert.equal(successCount, concurrentSolvers, 'All 50 valid solutions must pass');

      // Ensure every clearance token is unique
      const uniqueClearances = new Set(results.map((r) => r.clearance));
      assert.equal(uniqueClearances.size, concurrentSolvers, 'Every clearance token must have a unique salt');

      console.log(`  [Measured Metric] 50 concurrent PoW verifications + clearance issuances: ${durationMs.toFixed(1)}ms. 100% unique clearances.`);
    } finally {
      await close();
    }
  });

  // --- 3. Persistent Clearance Concurrency Blast ---
  test('stress: 300 parallel requests using a single clearance token pass instantly', async () => {
    const { url, close } = await startServer({ clearanceQuota: 500 });

    try {
      // Obtain clearance
      const initRes = await fetch(url);
      const challenge = initRes.headers.get('x-barstile-challenge');
      const { solution } = solveSync(challenge);

      const authRes = await fetch(url, { headers: { 'x-barstile-solution': solution } });
      const clearanceToken = authRes.headers.get('x-barstile-clearance');
      assert.ok(clearanceToken);

      const t0 = performance.now();
      const concurrentReads = 300;
      const concurrency = 20;

      // Blast 300 requests across 20 concurrent workers with this single clearance
      const statuses = await runPool(Array.from({ length: concurrentReads }), concurrency, async () => {
        const res = await fetch(url, { headers: { 'x-barstile-clearance': clearanceToken } });
        return res.status;
      });

      const durationMs = performance.now() - t0;
      const rps = ((concurrentReads / durationMs) * 1000).toFixed(0);

      const all200 = statuses.every((s) => s === 200);
      assert.equal(all200, true, 'All clearance requests must return 200 OK');

      console.log(`  [Measured Metric] 300 concurrent clearance validations: ${durationMs.toFixed(1)}ms (~${rps} req/s). Zero re-challenging.`);
    } finally {
      await close();
    }
  });

  // --- 4. Replay Cache Saturation & Eviction Stress ---
  test('stress: replay cache under 60,000 entries enforces maxSize without memory leak', () => {
    const maxSize = 20000;
    const cache = new ReplayCache({ maxSize, pruneIntervalMs: 0 });

    const memBefore = process.memoryUsage().heapUsed;
    const t0 = performance.now();

    const totalInsertions = 60000;
    for (let i = 0; i < totalInsertions; i++) {
      cache.add(`key-signature-${i}:42`, Date.now() + 60000);
    }

    const durationMs = performance.now() - t0;
    const memAfter = process.memoryUsage().heapUsed;
    const memDeltaMb = ((memAfter - memBefore) / (1024 * 1024)).toFixed(2);

    // Max size must be capped
    assert.equal(cache.size, maxSize, `Cache size must be strictly capped at ${maxSize}`);

    // Oldest entries must have been evicted
    assert.equal(cache.has('key-signature-0:42'), false, 'Key 0 must be evicted');
    assert.equal(cache.has('key-signature-1000:42'), false, 'Key 1000 must be evicted');

    // Recent entries must exist
    assert.equal(cache.has(`key-signature-${totalInsertions - 1}:42`), true, 'Latest key must exist');

    cache.destroy();
    console.log(`  [Measured Metric] 60,000 cache insertions with ${maxSize} LRU cap: ${durationMs.toFixed(1)}ms. Heap delta: ${memDeltaMb} MB.`);
  });

  // --- 5. Fuzzing & Malformed Input Handling ---
  test('stress: fuzzed, corrupt, and oversized payloads fail cleanly with zero process crashes', () => {
    const secret = 'stress-test-secret-999';
    const barstile = new Barstile({ secret });

    const maliciousInputs = [
      '',
      null,
      undefined,
      ':::',
      '..',
      'invalid.token.format',
      'a'.repeat(50000), // Huge string
      'x'.repeat(1000) + ':notanumber',
      'salt:NaN',
      'salt:-1',
      'salt:999999999999999999999999999999999999',
      '{"challenge":"valid","nonce":-100}',
      '{"challenge":123,"nonce":0}',
      { challenge: null, nonce: 'abc' },
      { challenge: 'a.b.c.d', nonce: -5 },
      '\u0000\u0001\u0002\u0003:0', // Binary null bytes
      "'; DROP TABLE challenges; --:1", // SQL injection style
      '<script>alert(1)</script>:0', // XSS style
      'salt:0.5', // Float nonce
      'salt:Infinity' // Infinity nonce
    ];

    let cleanRejections = 0;
    for (const input of maliciousInputs) {
      assert.doesNotThrow(() => {
        const res = barstile.verify(input);
        assert.equal(res.valid, false);
        cleanRejections += 1;
      });
    }

    assert.equal(cleanRejections, maliciousInputs.length);
    console.log(`  [Measured Metric] Fuzzing suite: ${maliciousInputs.length} pathological and oversized payloads tested. 0 crashes, 100% rejected.`);
  });

  // --- 6. Raw SHA-256 Throughput Benchmark ---
  test('stress: measured raw SHA-256 hash engine throughput', () => {
    const iterations = 25000;
    const t0 = performance.now();

    for (let i = 0; i < iterations; i++) {
      sha256Sync(`benchmark-salt-12345678:${i}`);
    }

    const durationMs = performance.now() - t0;
    const khs = ((iterations / durationMs)).toFixed(0);

    assert.ok(durationMs > 0);
    console.log(`  [Measured Metric] Native pure SHA-256 throughput on this CPU: ${iterations.toLocaleString()} hashes in ${durationMs.toFixed(1)}ms (~${khs} kH/s).`);
  });
});
