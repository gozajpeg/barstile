import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { barstileMiddleware } from '../src/server/middleware.js';
import { Barstile } from '../src/server/barstile.js';
import { solveSync } from '../src/client/solver.js';

describe('Pre-Challenge Request Body Memory Burn and DoS Mitigation', () => {
  const secret = 'dos_mitigation_secret_key_1234567890';
  const engine = new Barstile({ secret, difficulty: 2 });

  test('unverified request with oversized Content-Length is challenged immediately with Connection: close', async () => {
    const middleware = barstileMiddleware({
      engine,
      maxPreChallengeBodyBytes: 65536 // 64 KB
    });

    let destroyed = false;
    const req = {
      method: 'POST',
      url: '/api/upload',
      headers: {
        'content-length': '10485760' // 10 MB payload
      },
      destroy() {
        destroyed = true;
      }
    };

    const res = {
      headers: {},
      statusCode: 200,
      setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
      getHeader(name) { return this.headers[name.toLowerCase()]; },
      end(data) { this.body = data; }
    };

    let nextCalled = false;
    await middleware(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false, 'Should not yield to route handler');
    assert.equal(res.statusCode, 449, 'Should return HTTP 449');
    assert.equal(res.headers['connection'], 'close', 'Should close connection to terminate oversized payload');
    assert.ok(res.headers['x-barstile-challenge'], 'Should attach PoW challenge header');

    const json = JSON.parse(res.body);
    assert.equal(json.error, 'pow_required');
    assert.ok(json.message.includes('submitting request payload'));
  });

  test('active unverified stream under byte limit is drained cleanly without error', async () => {
    const middleware = barstileMiddleware({
      engine,
      maxPreChallengeBodyBytes: 65536
    });

    class MockStream extends EventEmitter {
      constructor() {
        super();
        this.resumed = false;
        this.complete = false;
      }
      resume() {
        this.resumed = true;
      }
      destroy() {
        this.destroyed = true;
      }
    }

    const req = new MockStream();
    req.method = 'POST';
    req.url = '/api/submit';
    req.headers = { 'content-length': '1024' };

    const res = {
      headers: {},
      statusCode: 200,
      setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
      getHeader(name) { return this.headers[name.toLowerCase()]; },
      end(data) { this.body = data; }
    };

    await middleware(req, res, () => {});

    assert.equal(res.statusCode, 449);
    assert.equal(req.resumed, true, 'Stream should be resumed in void mode to prevent backpressure');

    // Emitting safe small chunk should not destroy
    req.emit('data', Buffer.alloc(512));
    assert.equal(req.destroyed, undefined, 'Small stream under limit should not be forcibly destroyed');
  });

  test('unverified chunked stream exceeding byte limit is destroyed immediately', async () => {
    const middleware = barstileMiddleware({
      engine,
      maxPreChallengeBodyBytes: 1024 // 1 KB limit
    });

    class MockStream extends EventEmitter {
      constructor() {
        super();
        this.destroyed = false;
      }
      resume() {}
      destroy() {
        this.destroyed = true;
      }
    }

    const req = new MockStream();
    req.method = 'POST';
    req.url = '/api/stream';
    req.headers = {}; // Chunked transfer (no Content-Length)

    const res = {
      headers: {},
      statusCode: 200,
      setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
      getHeader(name) { return this.headers[name.toLowerCase()]; },
      end(data) { this.body = data; }
    };

    await middleware(req, res, () => {});
    assert.equal(res.statusCode, 449);

    // Attacker sends 2048 bytes (exceeding 1024 cap)
    req.emit('data', Buffer.alloc(2048));
    assert.equal(req.destroyed, true, 'Stream exceeding cap must be destroyed to prevent RAM flood');
  });

  test('verified request with solution header allows large payload without pre-challenge cap', async () => {
    const middleware = barstileMiddleware({
      engine,
      difficulty: 1,
      maxPreChallengeBodyBytes: 65536 // 64 KB
    });

    // 1. Send initial probe to obtain challenge
    const probeReq = {
      method: 'GET',
      url: '/api/large-upload',
      headers: {}
    };
    const probeRes = {
      headers: {},
      statusCode: 200,
      setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
      getHeader(name) { return this.headers[name.toLowerCase()]; },
      end(data) { this.body = data; }
    };
    await middleware(probeReq, probeRes, () => {});
    const challenge = probeRes.headers['x-barstile-challenge'];
    assert.ok(challenge);

    // 2. Solve challenge
    const solved = solveSync(challenge).solution;

    // 3. Send 20 MB payload with solved PoW header
    const req = {
      method: 'POST',
      url: '/api/large-upload',
      headers: {
        'x-barstile-solution': solved,
        'content-length': '20971520' // 20 MB
      }
    };

    const res = {
      headers: {},
      statusCode: 200,
      setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
      getHeader(name) { return this.headers[name.toLowerCase()]; },
      end(data) { this.body = data; }
    };

    let nextCalled = false;
    await middleware(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true, 'Request with valid solution header should pass directly to handler');
    assert.equal(req.barstile.verified, true);
    assert.ok(res.headers['x-barstile-clearance'], 'Should receive clearance token');
  });

  test('verified request with clearance token allows large payload without pre-challenge cap', async () => {
    const middleware = barstileMiddleware({
      engine,
      difficulty: 1,
      maxPreChallengeBodyBytes: 65536 // 64 KB
    });

    // 1. Solve challenge and obtain clearance token
    const probeReq = { method: 'GET', url: '/api/large-upload', headers: {} };
    const probeRes = {
      headers: {},
      statusCode: 200,
      setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
      getHeader(name) { return this.headers[name.toLowerCase()]; },
      end(data) { this.body = data; }
    };
    await middleware(probeReq, probeRes, () => {});
    const challenge = probeRes.headers['x-barstile-challenge'];
    const solved = solveSync(challenge).solution;

    const authReq = {
      method: 'POST',
      url: '/api/large-upload',
      headers: { 'x-barstile-solution': solved }
    };
    const authRes = {
      headers: {},
      statusCode: 200,
      setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
      getHeader(name) { return this.headers[name.toLowerCase()]; },
      end(data) { this.body = data; }
    };
    await middleware(authReq, authRes, () => {});
    const clearanceToken = authRes.headers['x-barstile-clearance'];
    assert.ok(clearanceToken);

    // 2. Submit 50 MB payload using clearance token
    const req = {
      method: 'POST',
      url: '/api/large-upload',
      headers: {
        'x-barstile-clearance': clearanceToken,
        'content-length': '52428800' // 50 MB
      }
    };

    const res = {
      headers: {},
      statusCode: 200,
      setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
      getHeader(name) { return this.headers[name.toLowerCase()]; },
      end(data) { this.body = data; }
    };

    let nextCalled = false;
    await middleware(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true, 'Verified client should pass through to upload handler');
    assert.equal(req.barstile.verified, true);
    assert.equal(res.headers['connection'], undefined, 'Connection should not be closed for verified client');
  });

  test('invalid solution on large payload closes connection and destroys stream immediately', async () => {
    const middleware = barstileMiddleware({
      engine,
      difficulty: 2,
      maxPreChallengeBodyBytes: 65536
    });

    let destroyed = false;
    const req = {
      method: 'POST',
      url: '/api/large-upload',
      headers: {
        'x-barstile-solution': 'bogus.challenge.fake.sig:99999',
        'content-length': '10485760' // 10 MB
      },
      destroy() {
        destroyed = true;
      }
    };

    const res = {
      headers: {},
      statusCode: 200,
      setHeader(name, val) { this.headers[name.toLowerCase()] = val; },
      getHeader(name) { return this.headers[name.toLowerCase()]; },
      end(data) { this.body = data; }
    };

    let nextCalled = false;
    await middleware(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.equal(res.headers['connection'], 'close');
  });
});
