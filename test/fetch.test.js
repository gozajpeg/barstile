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
});
