import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { RedisReplayStore } from '../src/server/redis.js';
import { Barstile } from '../src/server/barstile.js';
import { barstileMiddleware } from '../src/server/middleware.js';
import { solveSync } from '../src/client/solver.js';

class MockRedisClient {
  constructor() {
    this.storage = new Map();
    this.shouldThrow = false;
  }

  async set(key, value, ...args) {
    if (this.shouldThrow) {
      throw new Error('Redis connection lost');
    }

    const isNx = args.includes('NX') || (typeof args[1] === 'object' && args[1]?.NX);
    if (isNx && this.storage.has(key)) {
      return null;
    }

    this.storage.set(key, value);
    return 'OK';
  }

  async get(key) {
    if (this.shouldThrow) {
      throw new Error('Redis connection lost');
    }
    return this.storage.get(key) || null;
  }

  async exists(key) {
    if (this.shouldThrow) {
      throw new Error('Redis connection lost');
    }
    return this.storage.has(key) ? 1 : 0;
  }
}

describe('Redis Replay Store and Multi-Server Defense', () => {
  test('throws TypeError if redis client does not provide set method', () => {
    assert.throws(
      () => new RedisReplayStore(null),
      /requires a redis client/
    );
    assert.throws(
      () => new RedisReplayStore({}),
      /requires a redis client/
    );
  });

  test('checkAndAdd atomically returns true first time and false on duplicate', async () => {
    const mock = new MockRedisClient();
    const store = new RedisReplayStore(mock);

    const first = await store.checkAndAdd('sig:123', 60);
    assert.equal(first, true);

    const second = await store.checkAndAdd('sig:123', 60);
    assert.equal(second, false);
  });

  test('falls back gracefully to in-memory cache when Redis errors out', async () => {
    const mock = new MockRedisClient();
    const store = new RedisReplayStore(mock, { fallbackToMemory: true });

    mock.shouldThrow = true;

    const first = await store.checkAndAdd('sig:fallback', 60);
    assert.equal(first, true);

    const second = await store.checkAndAdd('sig:fallback', 60);
    assert.equal(second, false);
  });

  test('Barstile constructor auto-initializes RedisReplayStore when redis option passed', async () => {
    const mock = new MockRedisClient();
    const barstile = new Barstile({
      redis: mock,
      difficulty: 1
    });

    assert.ok(barstile.replayCache instanceof RedisReplayStore);

    const challenge = barstile.issueChallenge();
    const { solution } = solveSync(challenge);

    const result1 = await barstile.verify(solution);
    assert.equal(result1.valid, true);

    const result2 = await barstile.verify(solution);
    assert.equal(result2.valid, false);
    assert.equal(result2.reason, 'replay_detected');
  });

  test('barstileMiddleware works with redis option and prevents distributed replays', async () => {
    const mock = new MockRedisClient();
    const middleware = barstileMiddleware({
      redis: mock,
      difficulty: 1,
      clearance: false
    });

    const server = http.createServer((req, res) => {
      middleware(req, res, () => {
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true }));
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
      const initRes = await fetch(url);
      assert.equal(initRes.status, 449);
      const challenge = initRes.headers.get('x-barstile-challenge');
      const { solution } = solveSync(challenge);

      const pass1 = await fetch(url, { headers: { 'x-barstile-solution': solution } });
      assert.equal(pass1.status, 200);

      const pass2 = await fetch(url, { headers: { 'x-barstile-solution': solution } });
      assert.equal(pass2.status, 403);
      const body2 = await pass2.json();
      assert.equal(body2.reason, 'replay_detected');
    } finally {
      await close();
    }
  });

  test('multi-server defense WITHOUT Redis rejects solution shared across different clients', async () => {
    const sharedSecret = 'test-cluster-shared-secret-key-32chars!!';
    const server1 = new Barstile({ secret: sharedSecret, difficulty: 1 });
    const server2 = new Barstile({ secret: sharedSecret, difficulty: 1 });

    const clientAContext = '198.51.100.0/24:ua_client_a';
    const clientBContext = '203.0.113.0/24:ua_client_b';

    const challenge = server1.issueChallenge({ context: clientAContext });
    const { solution } = solveSync(challenge);

    const resClientAOnServer2 = await server2.verify(solution, { context: clientAContext });
    assert.equal(resClientAOnServer2.valid, true);

    const resClientBOnServer2 = await server2.verify(solution, { context: clientBContext });
    assert.equal(resClientBOnServer2.valid, false);
    assert.equal(resClientBOnServer2.reason, 'invalid_signature');
  });
});
