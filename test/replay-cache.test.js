import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ReplayCache } from '../src/core/replay-cache.js';

describe('Replay Cache', () => {
  test('records and detects duplicate keys', () => {
    const cache = new ReplayCache({ maxSize: 100, pruneIntervalMs: 0 });
    const key = 'test-sig:1234';
    const expiresAt = Date.now() + 60000;

    assert.equal(cache.has(key), false);
    cache.add(key, expiresAt);
    assert.equal(cache.has(key), true);

    cache.destroy();
  });

  test('automatically ignores expired keys upon lookup', () => {
    const cache = new ReplayCache({ maxSize: 100, pruneIntervalMs: 0 });
    const key = 'test-sig:expired';
    const pastExpiry = Date.now() - 1000;

    cache.add(key, pastExpiry);
    assert.equal(cache.has(key), false); // Expired -> returns false and purges

    cache.destroy();
  });

  test('prune() sweeps all expired entries', () => {
    const cache = new ReplayCache({ maxSize: 100, pruneIntervalMs: 0 });
    const now = Date.now();

    cache.add('valid-1', now + 10000);
    cache.add('expired-1', now - 1000);
    cache.add('expired-2', now - 2000);

    assert.equal(cache.size, 3);
    const prunedCount = cache.prune(now);

    assert.equal(prunedCount, 2);
    assert.equal(cache.size, 1);
    assert.equal(cache.has('valid-1'), true);

    cache.destroy();
  });

  test('evicts oldest entry when reaching maxSize', () => {
    const cache = new ReplayCache({ maxSize: 3, pruneIntervalMs: 0 });
    const expiry = Date.now() + 60000;

    cache.add('k1', expiry);
    cache.add('k2', expiry);
    cache.add('k3', expiry);
    assert.equal(cache.size, 3);

    // Adding 4th should evict 'k1'
    cache.add('k4', expiry);
    assert.equal(cache.size, 3);
    assert.equal(cache.has('k1'), false);
    assert.equal(cache.has('k2'), true);
    assert.equal(cache.has('k4'), true);

    cache.destroy();
  });
});
