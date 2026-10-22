import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { AllowanceCache } from '../src/core/cache.js';
import { Barstile } from '../src/server/barstile.js';
import { barstileMiddleware } from '../src/server/middleware.js';
import { RedisReplayStore } from '../src/server/redis.js';
import { solveSync } from '../src/client/solver.js';
import { barstileFetch } from '../src/client/fetch.js';

class MockRedisClient {
  constructor() {
    this.counters = new Map();
    this.ttls = new Map();
    this.shouldThrow = false;
  }

  async incr(key) {
    if (this.shouldThrow) {
      throw new Error('Redis connection dropped');
    }
    const current = (this.counters.get(key) || 0) + 1;
    this.counters.set(key, current);
    return current;
  }

  async expire(key, ttl) {
    if (this.shouldThrow) {
      throw new Error('Redis connection dropped');
    }
    this.ttls.set(key, ttl);
    return 1;
  }

  async set(key, val) {
    return 'OK';
  }
}

describe('Clearance Token Velocity & Request Allowance Budget', () => {
  test('AllowanceCache enforces maxQuota and tracks remaining balance', () => {
    const cache = new AllowanceCache();
    const quota = 3;
    const expiresAt = Date.now() + 60000;

    const r1 = cache.consume('token_sig_1', quota, expiresAt);
    assert.equal(r1.allowed, true);
    assert.equal(r1.remaining, 2);
    assert.equal(r1.count, 1);

    const r2 = cache.consume('token_sig_1', quota, expiresAt);
    assert.equal(r2.allowed, true);
    assert.equal(r2.remaining, 1);
    assert.equal(r2.count, 2);

    const r3 = cache.consume('token_sig_1', quota, expiresAt);
    assert.equal(r3.allowed, true);
    assert.equal(r3.remaining, 0);
    assert.equal(r3.count, 3);

    const r4 = cache.consume('token_sig_1', quota, expiresAt);
    assert.equal(r4.allowed, false);
    assert.equal(r4.remaining, 0);
    assert.equal(r4.count, 3);

    cache.destroy();
  });

  test('AllowanceCache allows unlimited requests when quota is 0', () => {
    const cache = new AllowanceCache();
    const expiresAt = Date.now() + 60000;

    for (let i = 0; i < 20; i++) {
      const res = cache.consume('token_unlimited', 0, expiresAt);
      assert.equal(res.allowed, true);
      assert.equal(res.remaining, Infinity);
    }

    cache.destroy();
  });

  test('AllowanceCache prunes expired sessions and enforces LRU maxSize', () => {
    const cache = new AllowanceCache({ maxSize: 2 });
    const past = Date.now() - 1000;
    const future = Date.now() + 60000;

    cache.consume('exp1', 10, past);
    cache.consume('exp2', 10, past);
    const pruned = cache.prune(Date.now());
    assert.equal(pruned, 2);
    assert.equal(cache.size, 0);

    cache.consume('item1', 10, future);
    cache.consume('item2', 10, future);
    cache.consume('item3', 10, future); // Triggers LRU eviction
    assert.equal(cache.size, 2);

    cache.destroy();
  });

  test('RedisReplayStore atomically increments quota and falls back on error', async () => {
    const mock = new MockRedisClient();
    const store = new RedisReplayStore(mock, { fallbackToMemory: true });

    const r1 = await store.consume('sig_redis', 2, 60);
    assert.equal(r1.allowed, true);
    assert.equal(r1.remaining, 1);

    const r2 = await store.consume('sig_redis', 2, 60);
    assert.equal(r2.allowed, true);
    assert.equal(r2.remaining, 0);

    const r3 = await store.consume('sig_redis', 2, 60);
    assert.equal(r3.allowed, false);
    assert.equal(r3.remaining, 0);

    // Test error fallback
    mock.shouldThrow = true;
    const fallbackRes = await store.consume('sig_redis_fallback', 2, 60);
    assert.equal(fallbackRes.allowed, true);

    store.destroy();
  });

  test('barstileMiddleware exhausts clearance quota and re-challenges client', async () => {
    const middleware = barstileMiddleware({
      difficulty: 1,
      clearanceQuota: 2 // Allow 2 requests per clearance token
    });

    const server = http.createServer((req, res) => {
      middleware(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, remaining: req.barstile.remaining }));
      });
    });

    const { url, close } = await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        resolve({
          url: `http://127.0.0.1:${port}`,
          close: () => new Promise((r) => server.close(r))
        });
      });
    });

    try {
      // 1. Initial request triggers 449 challenge
      const initRes = await fetch(url);
      assert.equal(initRes.status, 449);
      const challenge = initRes.headers.get('x-barstile-challenge');
      const { solution } = solveSync(challenge);

      // 2. Solve challenge: passes and issues clearance with quota of 2
      const solveRes = await fetch(url, { headers: { 'x-barstile-solution': solution } });
      assert.equal(solveRes.status, 200);
      assert.equal(solveRes.headers.get('x-barstile-remaining'), '2');
      const clearance = solveRes.headers.get('x-barstile-clearance');
      assert.ok(clearance);

      // 3. First request with clearance: allowed, remaining 1
      const req1 = await fetch(url, { headers: { 'x-barstile-clearance': clearance } });
      assert.equal(req1.status, 200);
      assert.equal(req1.headers.get('x-barstile-remaining'), '1');

      // 4. Second request with clearance: allowed, remaining 0
      const req2 = await fetch(url, { headers: { 'x-barstile-clearance': clearance } });
      assert.equal(req2.status, 200);
      assert.equal(req2.headers.get('x-barstile-remaining'), '0');

      // 5. Third request with clearance: quota exhausted! Must receive 449 with fresh challenge
      const req3 = await fetch(url, { headers: { 'x-barstile-clearance': clearance } });
      assert.equal(req3.status, 449, 'Expected 449 when quota exhausted');
      const exhaustedBody = await req3.json();
      assert.equal(exhaustedBody.error, 'clearance_exhausted');
      assert.ok(req3.headers.get('x-barstile-challenge'), 'Expected fresh challenge');
    } finally {
      await close();
    }
  });

  test('barstileFetch transparently renews clearance when quota is exhausted', async () => {
    const middleware = barstileMiddleware({
      difficulty: 1,
      clearanceQuota: 1 // Only 1 request allowed per clearance token
    });

    const server = http.createServer((req, res) => {
      middleware(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ count: req.barstile.remaining }));
      });
    });

    const { url, close } = await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        resolve({
          url: `http://127.0.0.1:${port}`,
          close: () => new Promise((r) => server.close(r))
        });
      });
    });

    try {
      // barstileFetch handles initial 449, solves PoW, and gets clearance
      const res1 = await barstileFetch(url);
      assert.equal(res1.status, 200);

      // Next request uses clearance (quota becomes 0)
      const res2 = await barstileFetch(url);
      assert.equal(res2.status, 200);

      // Third request hits exhausted clearance (449), barstileFetch transparently solves fresh PoW and succeeds!
      const res3 = await barstileFetch(url);
      assert.equal(res3.status, 200);
      assert.ok(res3.headers.get('x-barstile-clearance'), 'Received fresh clearance token');
    } finally {
      await close();
    }
  });
});
