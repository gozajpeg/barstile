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

  test('issues clearance token upon valid solution and persists across subsequent requests', async () => {
    const { url, close } = await createTestServer();

    try {
      // 1. Initial 449 challenge
      const initialRes = await fetch(url);
      const challenge = initialRes.headers.get('x-barstile-challenge');
      const { solution } = solveSync(challenge);

      // 2. Pass challenge and receive clearance token & cookie
      const solveRes = await fetch(url, {
        headers: { 'x-barstile-solution': solution }
      });
      assert.equal(solveRes.status, 200);

      const clearance = solveRes.headers.get('x-barstile-clearance');
      assert.ok(clearance, 'Expected x-barstile-clearance header');

      const setCookie = solveRes.headers.get('set-cookie');
      assert.ok(setCookie, 'Expected Set-Cookie header');
      assert.match(setCookie, /barstile_clearance=/);

      // 3. Subsequent request with clearance header passes immediately with 200 without PoW
      const nextResHeader = await fetch(url, {
        headers: { 'x-barstile-clearance': clearance }
      });
      assert.equal(nextResHeader.status, 200);
      const body1 = await nextResHeader.json();
      assert.equal(body1.telemetry.clearance, true);

      // 4. Subsequent request with clearance cookie passes immediately with 200 without PoW
      const nextResCookie = await fetch(url, {
        headers: { cookie: `barstile_clearance=${clearance}` }
      });
      assert.equal(nextResCookie.status, 200);
      const body2 = await nextResCookie.json();
      assert.equal(body2.telemetry.clearance, true);
    } finally {
      await close();
    }
  });

  test('rejects tampered clearance and issues fresh 449 challenge', async () => {
    const { url, close } = await createTestServer();

    try {
      const tamperedClearance = '1000.999999999999.fake_sig_1234567890abcdef1234567890abcdef';
      const res = await fetch(url, {
        headers: { 'x-barstile-clearance': tamperedClearance }
      });
      assert.equal(res.status, 449);
      assert.ok(res.headers.get('x-barstile-challenge'));
    } finally {
      await close();
    }
  });

  test('enforces cryptographic binding: rejects clearance token when shared across different IPs', async () => {
    const { url, close } = await createTestServer({ trustProxy: true });

    try {
      // 1. Bot 1 on IP 198.51.100.42 receives challenge and solves it
      const initRes = await fetch(url, {
        headers: {
          'x-forwarded-for': '198.51.100.42',
          'user-agent': 'BrowserClient/1.0'
        }
      });
      const challenge = initRes.headers.get('x-barstile-challenge');
      const { solution } = solveSync(challenge);

      // 2. Bot 1 submits solution and receives clearance token
      const solveRes = await fetch(url, {
        headers: {
          'x-forwarded-for': '198.51.100.42',
          'user-agent': 'BrowserClient/1.0',
          'x-barstile-solution': solution
        }
      });
      assert.equal(solveRes.status, 200);
      const clearanceToken = solveRes.headers.get('x-barstile-clearance');
      assert.ok(clearanceToken);

      // 3. Legitimate client reuses clearance from same IP -> 200 OK
      const legitRes = await fetch(url, {
        headers: {
          'x-forwarded-for': '198.51.100.42',
          'user-agent': 'BrowserClient/1.0',
          'x-barstile-clearance': clearanceToken
        }
      });
      assert.equal(legitRes.status, 200);
      const legitBody = await legitRes.json();
      assert.equal(legitBody.telemetry.clearance, true);

      // 4. Mobile user shifts within same /24 carrier subnet (198.51.100.88) -> 200 OK
      const mobileSubnetRes = await fetch(url, {
        headers: {
          'x-forwarded-for': '198.51.100.88',
          'user-agent': 'BrowserClient/1.0',
          'x-barstile-clearance': clearanceToken
        }
      });
      assert.equal(mobileSubnetRes.status, 200);

      // 5. Bot 2 on different IP (203.0.113.50) attempts to use Bot 1's clearance -> REJECTED (449)
      const bot2Res = await fetch(url, {
        headers: {
          'x-forwarded-for': '203.0.113.50',
          'user-agent': 'BrowserClient/1.0',
          'x-barstile-clearance': clearanceToken
        }
      });
      assert.equal(bot2Res.status, 449, 'Token sharing across different IPs must be rejected');
      assert.ok(bot2Res.headers.get('x-barstile-challenge'), 'Must issue fresh challenge');

      // 6. Same IP but different User-Agent (curl / python) attempts to use clearance -> REJECTED (449)
      const botDiffUaRes = await fetch(url, {
        headers: {
          'x-forwarded-for': '198.51.100.42',
          'user-agent': 'python-requests/2.31.0',
          'x-barstile-clearance': clearanceToken
        }
      });
      assert.equal(botDiffUaRes.status, 449, 'Token sharing across different User-Agents must be rejected');
    } finally {
      await close();
    }
  });

  test('allows CORS preflight OPTIONS requests to pass through untouched with Access-Control-Allow-Headers', async () => {
    const { url, close } = await createTestServer();

    try {
      const res = await fetch(url, { method: 'OPTIONS' });
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('x-barstile-challenge'), null);

      const allowHeaders = res.headers.get('access-control-allow-headers');
      assert.ok(allowHeaders, 'Expected access-control-allow-headers');
      assert.ok(allowHeaders.toLowerCase().includes('x-barstile-solution'));
      assert.ok(allowHeaders.toLowerCase().includes('x-barstile-clearance'));
    } finally {
      await close();
    }
  });

  test('standalone OPTIONS request without next() callback terminates with 204 No Content', async () => {
    const middleware = barstileMiddleware({ difficulty: 2 });
    const req = { method: 'OPTIONS', headers: {} };
    const res = {
      headers: {},
      statusCode: null,
      ended: false,
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      getHeader(k) { return this.headers[k.toLowerCase()]; },
      end() { this.ended = true; }
    };

    await middleware(req, res);
    assert.equal(res.statusCode, 204);
    assert.equal(res.ended, true);
    assert.ok(res.headers['access-control-allow-headers'].includes('x-barstile-solution'));
  });
});
