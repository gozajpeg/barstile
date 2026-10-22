import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { extractPathname, resolveRouteConfig } from '../src/core/route.js';
import { verifySolution } from '../src/core/verifier.js';
import { createChallengeToken } from '../src/core/challenge.js';
import { solveSync } from '../src/client/solver.js';
import { barstileMiddleware } from '../src/server/middleware.js';

describe('Route and Method Adaptive Difficulty', () => {
  const secret = 'adaptive_secret_key_1234567890123456';

  describe('extractPathname', () => {
    test('extracts clean path and strips queries and hashes', () => {
      assert.equal(extractPathname({ url: '/api/v1/users?page=1&limit=10' }), '/api/v1/users');
      assert.equal(extractPathname({ url: '/login#credentials' }), '/login');
      assert.equal(extractPathname({ url: '/checkout/?coupon=SAVE10' }), '/checkout');
      assert.equal(extractPathname({ url: '/' }), '/');
      assert.equal(extractPathname(null), '/');
    });

    test('prefers originalUrl or path when present', () => {
      assert.equal(extractPathname({ originalUrl: '/app/dashboard?user=1', url: '/dashboard' }), '/app/dashboard');
      assert.equal(extractPathname({ path: '/internal/status' }), '/internal/status');
    });
  });

  describe('resolveRouteConfig', () => {
    test('defaults to global options when no route rules match', () => {
      const cfg = resolveRouteConfig({ method: 'GET', url: '/about' }, { difficulty: 3, clearance: true, clearanceQuota: 50 });
      assert.equal(cfg.difficulty, 3);
      assert.equal(cfg.clearance, true);
      assert.equal(cfg.clearanceQuota, 50);
    });

    test('matches exact path and method', () => {
      const routes = {
        'POST /api/login': 5,
        'GET /api/login': 2,
        '/public/*': 1
      };

      const postLogin = resolveRouteConfig({ method: 'POST', url: '/api/login' }, { routes, difficulty: 3 });
      assert.equal(postLogin.difficulty, 5);

      const getLogin = resolveRouteConfig({ method: 'GET', url: '/api/login' }, { routes, difficulty: 3 });
      assert.equal(getLogin.difficulty, 2);
    });

    test('matches wildcards for route hierarchies', () => {
      const routes = {
        '/api/public/*': 2,
        '/api/admin/*': 5
      };

      const pub = resolveRouteConfig({ method: 'GET', url: '/api/public/items/42' }, { routes, difficulty: 4 });
      assert.equal(pub.difficulty, 2);

      const admin = resolveRouteConfig({ method: 'DELETE', url: '/api/admin/users/99' }, { routes, difficulty: 4 });
      assert.equal(admin.difficulty, 5);
    });

    test('supports route object options (disabling clearance, custom quota)', () => {
      const routes = {
        'POST /checkout': { difficulty: 4, clearance: false },
        'GET /search': { difficulty: 2, clearanceQuota: 20 }
      };

      const checkout = resolveRouteConfig({ method: 'POST', url: '/checkout' }, { routes, difficulty: 3, clearance: true });
      assert.equal(checkout.difficulty, 4);
      assert.equal(checkout.clearance, false);

      const search = resolveRouteConfig({ method: 'GET', url: '/search' }, { routes, difficulty: 3, clearanceQuota: 100 });
      assert.equal(search.difficulty, 2);
      assert.equal(search.clearance, true);
      assert.equal(search.clearanceQuota, 20);
    });

    test('supports dynamic difficulty evaluation function', () => {
      const dynamicFn = (req) => {
        if (req.headers && req.headers['x-attack-mode']) return 6;
        return 2;
      };

      const normal = resolveRouteConfig({ method: 'GET', url: '/resource', headers: {} }, { difficulty: dynamicFn });
      assert.equal(normal.difficulty, 2);

      const underAttack = resolveRouteConfig({ method: 'GET', url: '/resource', headers: { 'x-attack-mode': '1' } }, { difficulty: dynamicFn });
      assert.equal(underAttack.difficulty, 6);
    });

    test('clamps difficulty to safe boundaries [1, 8]', () => {
      const routes = {
        '/zero': 0,
        '/extreme': 99
      };

      const low = resolveRouteConfig({ method: 'GET', url: '/zero' }, { routes });
      assert.equal(low.difficulty, 1);

      const high = resolveRouteConfig({ method: 'GET', url: '/extreme' }, { routes });
      assert.equal(high.difficulty, 8);
    });
  });

  describe('Core Cross-Route Difficulty Enforcement', () => {
    test('rejects a low difficulty solution submitted to a high difficulty route', () => {
      // Create a challenge of difficulty 1
      const lowChallenge = createChallengeToken({ secret, difficulty: 1 });
      const solved = solveSync(lowChallenge).solution;

      // Verify against route requiring minDifficulty: 3
      const result = verifySolution({
        solution: solved,
        secret,
        minDifficulty: 3
      });

      assert.equal(result.valid, false);
      assert.equal(result.reason, 'insufficient_difficulty');
      assert.equal(result.difficulty, 1);
      assert.equal(result.requiredDifficulty, 3);
    });

    test('accepts solution if token difficulty meets or exceeds minDifficulty', () => {
      const challenge = createChallengeToken({ secret, difficulty: 2 });
      const solved = solveSync(challenge).solution;

      const result = verifySolution({
        solution: solved,
        secret,
        minDifficulty: 2
      });

      assert.equal(result.valid, true);
      assert.equal(result.difficulty, 2);
    });
  });

  describe('HTTP Middleware Integration with Route Rules', () => {
    test('issues route-specific challenge difficulty and honors clearance: false', async () => {
      const middleware = barstileMiddleware({
        secret,
        difficulty: 3,
        routes: {
          'GET /api/catalog': 1,
          'POST /api/purchase': { difficulty: 2, clearance: false }
        }
      });

      // 1. Unauthenticated request to /api/catalog receives difficulty 1 challenge
      const req1 = { method: 'GET', url: '/api/catalog', headers: {} };
      const res1 = {
        headers: {},
        statusCode: 200,
        setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
        getHeader(name) { return this.headers[name.toLowerCase()]; },
        end(data) { this.body = data; }
      };

      await middleware(req1, res1, () => {});
      assert.equal(res1.statusCode, 449);
      const challengeCatalog = res1.headers['x-barstile-challenge'];
      assert.ok(challengeCatalog);
      const partsCatalog = challengeCatalog.split('.');
      assert.equal(partsCatalog[1], '1'); // Difficulty 1

      // 2. Solve the difficulty 1 challenge
      const solution1 = solveSync(challengeCatalog).solution;

      // 3. Submit solution to /api/catalog (default clearance is true)
      const req2 = {
        method: 'GET',
        url: '/api/catalog',
        headers: { 'x-barstile-solution': solution1 }
      };
      let passedCatalog = false;
      const res2 = {
        headers: {},
        statusCode: 200,
        setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
        getHeader(name) { return this.headers[name.toLowerCase()]; },
        end(data) { this.body = data; }
      };

      await middleware(req2, res2, () => { passedCatalog = true; });
      assert.ok(passedCatalog);
      assert.ok(res2.headers['x-barstile-clearance'], 'Clearance should be granted for /api/catalog');

      // 4. Request /api/purchase: route requires difficulty 2 and clearance: false
      const req3 = { method: 'POST', url: '/api/purchase', headers: {} };
      const res3 = {
        headers: {},
        statusCode: 200,
        setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
        getHeader(name) { return this.headers[name.toLowerCase()]; },
        end(data) { this.body = data; }
      };

      await middleware(req3, res3, () => {});
      assert.equal(res3.statusCode, 449);
      const challengePurchase = res3.headers['x-barstile-challenge'];
      const partsPurchase = challengePurchase.split('.');
      assert.equal(partsPurchase[1], '2'); // Difficulty 2

      // 5. If attacker tries to send difficulty 1 solution to /api/purchase, it is rejected
      const req4 = {
        method: 'POST',
        url: '/api/purchase',
        headers: { 'x-barstile-solution': solution1 }
      };
      const res4 = {
        headers: {},
        statusCode: 200,
        setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
        getHeader(name) { return this.headers[name.toLowerCase()]; },
        end(data) { this.body = data; }
      };

      await middleware(req4, res4, () => {});
      assert.equal(res4.statusCode, 403);
      const failJson = JSON.parse(res4.body);
      assert.equal(failJson.reason, 'insufficient_difficulty');

      // 6. Legitimate solve for /api/purchase with difficulty 2 passes but issues NO clearance token
      const solution2 = solveSync(challengePurchase).solution;
      const req5 = {
        method: 'POST',
        url: '/api/purchase',
        headers: { 'x-barstile-solution': solution2 }
      };
      let passedPurchase = false;
      const res5 = {
        headers: {},
        statusCode: 200,
        setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
        getHeader(name) { return this.headers[name.toLowerCase()]; },
        end(data) { this.body = data; }
      };

      await middleware(req5, res5, () => { passedPurchase = true; });
      assert.ok(passedPurchase);
      assert.equal(res5.headers['x-barstile-clearance'], undefined, 'No clearance token issued when clearance: false');
    });
  });
});
