import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createBarstile } from '../src/server/barstile.js';
import { handleRequest, verifyAction } from '../src/server/fetch.js';
import { solveSync } from '../src/client/solver.js';

describe('Web Standard Fetch API & Next.js Server Action Protection', () => {
  const engine = createBarstile({ difficulty: 1 });

  describe('handleRequest (Fetch API Middleware)', () => {
    test('GET /api/barstile/challenge returns HTTP 200 with challenge JSON and header', async () => {
      const request = new Request('http://localhost:3000/api/barstile/challenge', {
        method: 'GET'
      });

      const response = await handleRequest(engine, request);
      assert.ok(response instanceof Response, 'Must return a Response instance');
      assert.equal(response.status, 200);

      const challengeHeader = response.headers.get('X-Barstile-Challenge');
      assert.ok(challengeHeader, 'Must set X-Barstile-Challenge header');

      const cacheControl = response.headers.get('Cache-Control');
      assert.equal(cacheControl, 'private, no-store, no-cache, max-age=0', 'Must prevent CDN and Next.js caching');

      const body = await response.json();
      assert.equal(body.challenge, challengeHeader);
    });

    test('POST /api/barstile/verify rejects missing solution with HTTP 400', async () => {
      const request = new Request('http://localhost:3000/api/barstile/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const response = await handleRequest(engine, request);
      assert.equal(response.status, 400);
      const body = await response.json();
      assert.equal(body.error, 'solution_required');
    });

    test('POST /api/barstile/verify accepts valid solution and sets clearance cookie', async () => {
      // 1. Get challenge
      const chalReq = new Request('http://localhost:3000/api/barstile/challenge');
      const chalRes = await handleRequest(engine, chalReq);
      const { challenge } = await chalRes.json();

      // 2. Solve challenge
      const { solution } = solveSync(challenge);

      // 3. Verify solution via POST
      const verifyReq = new Request('http://localhost:3000/api/barstile/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solution })
      });

      const verifyRes = await handleRequest(engine, verifyReq);
      assert.equal(verifyRes.status, 200);

      const body = await verifyRes.json();
      assert.equal(body.verified, true);
      assert.ok(body.clearance, 'Must return clearance token in body');

      const setCookie = verifyRes.headers.get('Set-Cookie');
      assert.ok(setCookie.includes('barstile_clearance='), 'Must set barstile_clearance cookie');
    });

    test('unverified route returns HTTP 449 challenge response', async () => {
      const request = new Request('http://localhost:3000/api/protected/data', {
        method: 'GET'
      });

      const response = await handleRequest(engine, request);
      assert.ok(response, 'Must intercept unverified request');
      assert.equal(response.status, 449);

      const cacheControl = response.headers.get('Cache-Control');
      assert.equal(cacheControl, 'private, no-store, no-cache, max-age=0', 'Must prevent CDN and Next.js caching');

      const body = await response.json();
      assert.equal(body.error, 'challenge_required');
      assert.ok(body.challenge);
    });

    test('route with valid clearance cookie returns null (allows pass-through)', async () => {
      const clearance = engine.issueClearance(900000);

      const request = new Request('http://localhost:3000/api/protected/data', {
        method: 'GET',
        headers: {
          Cookie: `barstile_clearance=${clearance}`
        }
      });

      const response = await handleRequest(engine, request);
      assert.equal(response, null, 'Must return null so Next.js/Hono proceeds to next handler');
    });

    test('route with valid X-Barstile-Clearance header returns null (allows pass-through)', async () => {
      const clearance = engine.issueClearance(900000);

      const request = new Request('http://localhost:3000/api/protected/data', {
        method: 'GET',
        headers: {
          'X-Barstile-Clearance': clearance
        }
      });

      const response = await handleRequest(engine, request);
      assert.equal(response, null);
    });

    test('shouldChallenge option allows specific routes to bypass verification', async () => {
      const request = new Request('http://localhost:3000/public/assets', {
        method: 'GET'
      });

      const response = await handleRequest(engine, request, {
        shouldChallenge: (req) => new URL(req.url).pathname.startsWith('/api/')
      });

      assert.equal(response, null, 'Public routes must bypass check');
    });
  });

  describe('verifyAction (Next.js Server Action Protection)', () => {
    test('verifies standard FormData with clearance token', async () => {
      const clearance = engine.issueClearance(900000);
      const formData = new FormData();
      formData.set('name', 'Alice');
      formData.set('barstile-token', clearance);

      const result = await verifyAction(formData, { engine });
      assert.equal(result.valid, true);
      assert.equal(result.type, 'clearance');
      assert.equal(result.token, clearance);
    });

    test('verifies standard FormData with proof-of-work solution token', async () => {
      const challenge = engine.issueChallenge({ difficulty: 1 });
      const { solution } = solveSync(challenge);

      const formData = new FormData();
      formData.set('name', 'Bob');
      formData.set('barstile-token', solution);

      const result = await verifyAction(formData, { engine });
      assert.equal(result.valid, true);
      assert.equal(result.type, 'solution');
    });

    test('rejects FormData when token is missing', async () => {
      const formData = new FormData();
      formData.set('name', 'Eve');

      const result = await verifyAction(formData, { engine });
      assert.equal(result.valid, false);
      assert.equal(result.error, 'missing_token');
    });

    test('rejects FormData when token is invalid or tampered', async () => {
      const formData = new FormData();
      formData.set('barstile-token', 'tampered.bogus.token:99999');

      const result = await verifyAction(formData, { engine });
      assert.equal(result.valid, false);
      assert.ok(result.error);
    });

    test('prevents replay attack when solution token is submitted twice', async () => {
      const challenge = engine.issueChallenge({ difficulty: 1 });
      const { solution } = solveSync(challenge);

      const formData = new FormData();
      formData.set('barstile-token', solution);

      // First submission passes
      const firstResult = await verifyAction(formData, { engine });
      assert.equal(firstResult.valid, true);

      // Second submission fails with replay error
      const secondResult = await verifyAction(formData, { engine });
      assert.equal(secondResult.valid, false);
      assert.equal(secondResult.error, 'replay_detected');
    });
  });
});
