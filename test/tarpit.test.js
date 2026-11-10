import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { TarpitTracker } from '../src/core/tarpit.js';
import { barstileMiddleware } from '../src/server/middleware.js';
import { createBarstile } from '../src/server/barstile.js';

describe('Adaptive Tarpit & IP Flood Defense', () => {
  test('TarpitTracker tracks sliding window rate and enforces maxRequests', () => {
    const tracker = new TarpitTracker({
      maxRequests: 3,
      windowMs: 1000,
      pruneIntervalMs: 0
    });

    const ip = '192.168.1.10';
    const now = 10000;

    const r1 = tracker.recordRequest(ip, now);
    assert.equal(r1.allowed, true);
    assert.equal(r1.count, 1);
    assert.equal(r1.remaining, 2);

    const r2 = tracker.recordRequest(ip, now + 100);
    assert.equal(r2.allowed, true);
    assert.equal(r2.count, 2);

    const r3 = tracker.recordRequest(ip, now + 200);
    assert.equal(r3.allowed, true);
    assert.equal(r3.count, 3);
    assert.equal(r3.remaining, 0);

    // 4th request exceeds maxRequests in the current window
    const r4 = tracker.recordRequest(ip, now + 300);
    assert.equal(r4.allowed, false);
    assert.equal(r4.remaining, 0);

    // Slide window so r1 and r2 expire (t = 11100ms, window starts at 10100ms)
    const r5 = tracker.recordRequest(ip, now + 1100);
    assert.equal(r5.allowed, true);
    assert.equal(r5.count, 2); // r1 and r2 expired, only r3 and r5 in window

    // Slide window completely past r3 (t = 12500ms)
    const r6 = tracker.recordRequest(ip, now + 2500);
    assert.equal(r6.allowed, true);
    assert.equal(r6.count, 1);

    tracker.destroy();
  });

  test('TarpitTracker evicts oldest entries under LRU cap to strictly bound memory', () => {
    const tracker = new TarpitTracker({
      maxTrackedIps: 3,
      pruneIntervalMs: 0
    });

    tracker.recordRequest('10.0.0.1', 1000);
    tracker.recordRequest('10.0.0.2', 1001);
    tracker.recordRequest('10.0.0.3', 1002);

    assert.equal(tracker.records.size, 3);

    // Access 10.0.0.1 so 10.0.0.2 becomes oldest
    tracker.recordRequest('10.0.0.1', 1003);

    // Add 4th IP -> evicts 10.0.0.2
    tracker.recordRequest('10.0.0.4', 1004);

    assert.equal(tracker.records.size, 3);
    assert.equal(tracker.records.has('10.0.0.2'), false);
    assert.equal(tracker.records.has('10.0.0.1'), true);
    assert.equal(tracker.records.has('10.0.0.3'), true);
    assert.equal(tracker.records.has('10.0.0.4'), true);

    tracker.destroy();
  });

  test('TarpitTracker penalizes IP after consecutive verification failures', () => {
    const tracker = new TarpitTracker({
      consecutiveFailureThreshold: 3,
      tarpitDelayMs: 2000,
      pruneIntervalMs: 0
    });

    const ip = '10.0.0.50';
    const now = 5000;

    assert.equal(tracker.isPenalized(ip, now), false);

    tracker.recordFailure(ip, now);
    assert.equal(tracker.isPenalized(ip, now), false);

    tracker.recordFailure(ip, now + 10);
    assert.equal(tracker.isPenalized(ip, now + 10), false);

    const f3 = tracker.recordFailure(ip, now + 20);
    assert.equal(f3.penalized, true);
    assert.equal(tracker.isPenalized(ip, now + 20), true);

    // Request is blocked while penalized
    const reqRes = tracker.recordRequest(ip, now + 30);
    assert.equal(reqRes.allowed, false);
    assert.equal(reqRes.penalized, true);

    // Success resets failure count
    tracker.recordSuccess(ip, now + 40);
    assert.equal(tracker.isPenalized(ip, now + 40), false);

    tracker.destroy();
  });

  describe('Middleware Tarpit Integration', () => {
    let server;
    let serverUrl;
    let engine;

    before(async () => {
      engine = createBarstile({ difficulty: 1 });
      const guard = barstileMiddleware({
        engine,
        difficulty: 1,
        tarpit: {
          maxRequests: 3,
          windowMs: 5000,
          delayMs: 20,
          consecutiveFailureThreshold: 2
        }
      });

      server = http.createServer((req, res) => {
        guard(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        });
      });

      await new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => {
          const port = server.address().port;
          serverUrl = `http://127.0.0.1:${port}`;
          resolve();
        });
      });
    });

    after(async () => {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    test('middleware returns HTTP 429 when IP exceeds request limit', async () => {
      const res1 = await fetch(`${serverUrl}/api/test`);
      assert.equal(res1.status, 449);

      const res2 = await fetch(`${serverUrl}/api/test`);
      assert.equal(res2.status, 449);

      const res3 = await fetch(`${serverUrl}/api/test`);
      assert.equal(res3.status, 449);

      // 4th request from same IP is tarpitted
      const res4 = await fetch(`${serverUrl}/api/test`);
      assert.equal(res4.status, 429);
      const body4 = await res4.json();
      assert.equal(body4.error, 'tarpit_limit_exceeded');
    });
  });

  describe('Middleware Socket Drop Defense', () => {
    let dropServer;
    let dropServerUrl;

    before(async () => {
      const dropGuard = barstileMiddleware({
        difficulty: 1,
        tarpit: {
          maxRequests: 1,
          windowMs: 5000,
          dropSocket: true
        }
      });

      dropServer = http.createServer((req, res) => {
        dropGuard(req, res, () => {
          res.statusCode = 200;
          res.end('ok');
        });
      });

      await new Promise((resolve) => {
        dropServer.listen(0, '127.0.0.1', () => {
          const port = dropServer.address().port;
          dropServerUrl = `http://127.0.0.1:${port}`;
          resolve();
        });
      });
    });

    after(async () => {
      if (dropServer) {
        await new Promise((resolve) => dropServer.close(resolve));
      }
    });

    test('middleware drops socket when dropSocket is enabled for abusive IP', async () => {
      const res1 = await fetch(`${dropServerUrl}/data`);
      assert.equal(res1.status, 449);

      // Second request exceeds limit and has socket destroyed
      await assert.rejects(
        async () => {
          await fetch(`${dropServerUrl}/data`);
        },
        /fetch failed|ECONNRESET|socket hang up/i
      );
    });

    test('TarpitTracker handles null, undefined, or empty IP values gracefully', () => {
      const tracker = new TarpitTracker({ maxRequests: 2 });

      assert.doesNotThrow(() => {
        const r1 = tracker.recordRequest(null);
        assert.equal(typeof r1.allowed, 'boolean');

        const r2 = tracker.recordRequest(undefined);
        assert.equal(typeof r2.allowed, 'boolean');

        const r3 = tracker.recordFailure('');
        assert.equal(typeof r3.penalized, 'boolean');

        const p = tracker.isPenalized(null);
        assert.equal(typeof p, 'boolean');

        tracker.recordSuccess(null);
      });

      tracker.destroy();
    });

    test('TarpitTracker prune sweeps expired records and removes empty IP entries', () => {
      const tracker = new TarpitTracker({ windowMs: 100, pruneIntervalMs: 0 });
      const now = 10000;

      tracker.recordRequest('1.2.3.4', now);
      assert.equal(tracker.records.size, 1);

      // Prune after window passes
      tracker.prune(now + 200);
      assert.equal(tracker.records.has('1.2.3.4'), false);

      tracker.destroy();
    });
  });
});
