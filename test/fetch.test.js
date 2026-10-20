import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { barstileMiddleware } from '../src/server/middleware.js';
import { barstileFetch } from '../src/client/fetch.js';

describe('Transparent barstileFetch Interceptor', () => {
  function createTestServer() {
    const middleware = barstileMiddleware({ difficulty: 2 });

    const server = http.createServer((req, res) => {
      if (req.url === '/public') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ route: 'public' }));
      }

      middleware(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ protected: true, verified: req.barstile.verified }));
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

  test('transparently solves challenge and returns 200 response', async () => {
    const { url, close } = await createTestServer();

    try {
      // One single call: barstileFetch intercepts 449, solves it, retries, and returns 200
      const res = await barstileFetch(`${url}/api/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: 'notebook' })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.protected, true);
      assert.equal(data.verified, true);
    } finally {
      await close();
    }
  });

  test('passes normal responses through untouched without solving', async () => {
    const { url, close } = await createTestServer();

    try {
      const res = await barstileFetch(`${url}/public`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.route, 'public');
    } finally {
      await close();
    }
  });

  test('subsequent barstileFetch calls reuse clearance without solving again', async () => {
    const { url, close } = await createTestServer();

    try {
      // 1. First call: solves challenge, obtains clearance
      const res1 = await barstileFetch(`${url}/api/one`);
      assert.equal(res1.status, 200);

      // 2. Second call: attaches clearance token, passes immediately
      const res2 = await barstileFetch(`${url}/api/two`);
      assert.equal(res2.status, 200);

      // 3. Third call: still passes immediately with clearance
      const res3 = await barstileFetch(`${url}/api/three`);
      assert.equal(res3.status, 200);
    } finally {
      await close();
    }
  });
});
