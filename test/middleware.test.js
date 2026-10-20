import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { barstileMiddleware } from '../src/server/middleware.js';
import { solveSync } from '../src/client/solver.js';

describe('HTTP Middleware Integration', () => {
  function createTestServer(middlewareOptions = {}) {
    const middleware = barstileMiddleware({
      difficulty: 2, // Fast for unit tests
      ...middlewareOptions
    });

    const server = http.createServer((req, res) => {
      middleware(req, res, () => {
        // Route handler reached if barstile passed
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, telemetry: req.barstile }));
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

  test('request without solution returns 449 with X-Barstile-Challenge header', async () => {
    const { url, close } = await createTestServer();

    try {
      const res = await fetch(url);
      assert.equal(res.status, 449);

      const challenge = res.headers.get('x-barstile-challenge');
      assert.ok(challenge, 'Expected x-barstile-challenge header');

      const body = await res.json();
      assert.equal(body.error, 'pow_required');
      assert.equal(body.challenge, challenge);
    } finally {
      await close();
    }
  });

  test('request with valid solution passes through with 200 OK', async () => {
    const { url, close } = await createTestServer();

    try {
      // 1. Get challenge
      const initialRes = await fetch(url);
      const challenge = initialRes.headers.get('x-barstile-challenge');

      // 2. Solve challenge
      const { solution } = solveSync(challenge);

      // 3. Submit solution
      const authedRes = await fetch(url, {
        headers: {
          'x-barstile-solution': solution
        }
      });

      assert.equal(authedRes.status, 200);
      const body = await authedRes.json();
      assert.equal(body.success, true);
      assert.equal(body.telemetry.verified, true);
      assert.equal(body.telemetry.difficulty, 2);
    } finally {
      await close();
    }
  });

  test('submitting the same solution twice gets rejected with 403 replay', async () => {
    const { url, close } = await createTestServer();

    try {
      const initialRes = await fetch(url);
      const challenge = initialRes.headers.get('x-barstile-challenge');
      const { solution } = solveSync(challenge);

      // First pass -> 200 OK
      const pass1 = await fetch(url, {
        headers: { 'x-barstile-solution': solution }
      });
      assert.equal(pass1.status, 200);

      // Replay attempt -> 403 Forbidden
      const pass2 = await fetch(url, {
        headers: { 'x-barstile-solution': solution }
      });
      assert.equal(pass2.status, 403);
      const body = await pass2.json();
      assert.equal(body.error, 'barstile_failed');
      assert.equal(body.reason, 'replay_detected');
    } finally {
      await close();
    }
  });

  test('shouldChallenge filter allows bypassing when false', async () => {
    const { url, close } = await createTestServer({
      shouldChallenge: (req) => req.url.includes('/protected')
    });

    try {
      // Unprotected route passes immediately without solution
      const openRes = await fetch(`${url}/public`);
      assert.equal(openRes.status, 200);

      // Protected route triggers challenge
      const protectedRes = await fetch(`${url}/protected`);
      assert.equal(protectedRes.status, 449);
    } finally {
      await close();
    }
  });

  test('appends to existing Access-Control-Expose-Headers without overwriting', async () => {
    const middleware = barstileMiddleware({ difficulty: 2 });
    const server = http.createServer((req, res) => {
      res.setHeader('Access-Control-Expose-Headers', 'X-Custom-Token');
      middleware(req, res, () => {
        res.statusCode = 200;
        res.end();
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
      const res = await fetch(url);
      const exposed = res.headers.get('access-control-expose-headers');
      assert.ok(exposed.includes('X-Custom-Token'), 'Expected custom header to be preserved');
      assert.ok(exposed.includes('x-barstile-challenge'), 'Expected barstile header to be appended');
    } finally {
      await close();
    }
  });

  test('supports custom pluggable replayCache store', async () => {
    const customStore = {
      seen: new Set(),
      has(k) { return this.seen.has(k); },
      add(k) { this.seen.add(k); }
    };

    const { url, close } = await createTestServer({
      replayCache: customStore
    });

    try {
      const initialRes = await fetch(url);
      const challenge = initialRes.headers.get('x-barstile-challenge');
      const { solution } = solveSync(challenge);

      const pass1 = await fetch(url, { headers: { 'x-barstile-solution': solution } });
      assert.equal(pass1.status, 200);
      assert.equal(customStore.seen.size, 1);

      const pass2 = await fetch(url, { headers: { 'x-barstile-solution': solution } });
      assert.equal(pass2.status, 403);
    } finally {
      await close();
    }
  });
});
