import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  syncServerTime,
  getServerTime,
  getClockOffset,
  resetClockOffset
} from '../src/client/clock.js';
import { createChallengeToken } from '../src/core/challenge.js';
import { solve, solveSync } from '../src/client/solver.js';

describe('Client-Server Clock Skew Synchronization', () => {
  const secret = 'clock_skew_secret_key_32_bytes_123';

  beforeEach(() => {
    resetClockOffset();
  });

  test('calculates correct clockOffset from HTTP Date response header', () => {
    // Simulated server is 5 minutes (300,000 ms) in the future relative to local clock
    const localNow = Date.now();
    const serverTimestamp = localNow + 300_000;
    const mockDateHeader = new Date(serverTimestamp).toUTCString();

    const mockResponse = {
      headers: new Headers({
        'date': mockDateHeader
      })
    };

    const offset = syncServerTime(mockResponse);
    // Allow minor millisecond rounding in Date formatting
    assert.ok(Math.abs(offset - 300_000) < 1500, `Expected offset ~300000, got ${offset}`);
    assert.ok(Math.abs(getServerTime() - serverTimestamp) < 1500);
  });

  test('calculates correct clockOffset from number timestamp or Date instance', () => {
    const targetServerTime = Date.now() - 120_000; // 2 minutes behind
    syncServerTime(targetServerTime);

    assert.ok(Math.abs(getClockOffset() - (-120_000)) < 100);
    assert.ok(Math.abs(getServerTime() - targetServerTime) < 100);

    // Also accepts Date object
    const futureDate = new Date(Date.now() + 60_000);
    syncServerTime(futureDate);
    assert.ok(getClockOffset() > 50_000);
  });

  test('solves challenges when client clock is 10 minutes fast without premature expiration', async () => {
    // Server issues challenge with 60s TTL at server time T
    const serverNow = Date.now();
    const challenge = createChallengeToken({ secret, difficulty: 1, ttlMs: 60_000, now: serverNow });

    // Client's local clock is 10 minutes (600,000 ms) AHEAD of server
    // Without sync, client Date.now() > expiresAt (which is serverNow + 60,000)
    // Synchronize client with actual server time:
    syncServerTime(serverNow);

    // Solve should succeed without throwing 'challenge token has already expired'
    const resultSync = solveSync(challenge);
    assert.ok(resultSync.solution);
    assert.ok(resultSync.hash.startsWith('0'));

    const resultAsync = await solve(challenge);
    assert.ok(resultAsync.solution);
  });

  test('still rejects genuinely expired challenges even when clock offset is synchronized', async () => {
    // Challenge created with 1 second TTL
    const challenge = createChallengeToken({ secret, difficulty: 1, ttlMs: 1000 });

    // Server time is 5 seconds in the future (token expired 4 seconds ago on server)
    syncServerTime(Date.now() + 5000);

    assert.throws(
      () => solveSync(challenge),
      /challenge token has already expired/
    );

    await assert.rejects(
      () => solve(challenge),
      /challenge token has already expired/
    );
  });

  test('ignores Date header if response contains Age header from proxy cache', () => {
    resetClockOffset();
    const mockCachedResponse = {
      headers: new Headers({
        'date': new Date(Date.now() - 600_000).toUTCString(), // 10 mins old
        'age': '600'
      })
    };

    const offset = syncServerTime(mockCachedResponse);
    assert.equal(offset, 0, 'Offset should remain 0 when response is cached');
    assert.equal(getClockOffset(), 0);
  });

  test('synchronizes Date header when response has Age: 0 (fresh CDN cache miss)', () => {
    resetClockOffset();
    const serverTimestamp = Date.now() + 180_000; // 3 minutes ahead
    const mockFreshResponse = {
      headers: new Headers({
        'date': new Date(serverTimestamp).toUTCString(),
        'age': '0'
      })
    };

    const offset = syncServerTime(mockFreshResponse);
    assert.ok(Math.abs(offset - 180_000) < 1500, 'Should sync from Date header when Age is 0');
  });
});
