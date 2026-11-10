import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { barstileMiddleware } from '../src/server/middleware.js';
import { encodeProbeTelemetry } from '../src/client/probe.js';

describe('Enterprise Anti-Bot & Adaptive Risk Middleware Integration', () => {
  const secret = 'enterprise_test_secret_32_bytes_long_12345';

  test('silent pass grants immediate clearance to trusted human without PoW challenge', async () => {
    const middleware = barstileMiddleware({
      secret,
      difficulty: 4,
      adaptiveRisk: true,
      allowSilentPass: true
    });

    const trustedProbe = {
      timestamp: Date.now(),
      evalDurationMs: 5,
      automation: { isAutomated: false, markers: [] },
      anomalies: [],
      renderer: { isSoftwareRasterizer: false },
      tampered: [],
      hardware: { concurrency: 8, deviceMemory: 16, languagesCount: 1 }
    };
    const telemetryHeader = encodeProbeTelemetry(trustedProbe, 'test_salt');

    const req = {
      method: 'GET',
      url: '/api/resource',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36',
        'sec-ch-ua-platform': '"Windows"',
        'accept-language': 'en-US',
        'x-barstile-telemetry': telemetryHeader
      }
    };

    let nextCalled = false;
    const res = {
      headers: {},
      statusCode: 200,
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      getHeader(k) { return this.headers[k.toLowerCase()]; },
      end() {}
    };

    await middleware(req, res, () => { nextCalled = true; });

    // Legitimate user bypassed PoW with 0 ms delay!
    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['x-barstile-clearance'], 'Issued clearance token transparently');
    assert.equal(req.barstile.verified, true);
    assert.equal(req.barstile.silentPass, true);
  });

  test('blocks detected automation bots with 403 Forbidden even before PoW', async () => {
    const middleware = barstileMiddleware({
      secret,
      difficulty: 4,
      adaptiveRisk: true,
      blockBots: true
    });

    const botProbe = {
      timestamp: Date.now(),
      evalDurationMs: 2,
      automation: { isAutomated: true, markers: ['webdriver_active', 'global_puppeteer_eval'] },
      anomalies: ['zero_outer_dimensions'],
      renderer: { isSoftwareRasterizer: true },
      tampered: []
    };
    const telemetryHeader = encodeProbeTelemetry(botProbe, 'test_salt');

    const req = {
      method: 'GET',
      url: '/api/checkout',
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/122.0.0.0',
        'x-barstile-telemetry': telemetryHeader
      }
    };

    let responseBody = '';
    const res = {
      headers: {},
      statusCode: 200,
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      getHeader(k) { return this.headers[k.toLowerCase()]; },
      end(data) { responseBody = data; }
    };

    await middleware(req, res, () => {});

    assert.equal(res.statusCode, 403);
    const parsed = JSON.parse(responseBody);
    assert.equal(parsed.error, 'barstile_failed');
    assert.equal(parsed.reason, 'automation_detected');
    assert.ok(parsed.markers.includes('webdriver_active'));
  });

  test('escalates PoW difficulty for ambiguous / suspicious requests under adaptiveRisk', async () => {
    const middleware = barstileMiddleware({
      secret,
      difficulty: 2, // baseline difficulty 2
      adaptiveRisk: true
    });

    // Request missing user agent with software rasterizer (suspicious)
    const suspiciousProbe = {
      timestamp: Date.now(),
      evalDurationMs: 1,
      automation: { isAutomated: false, markers: [] },
      anomalies: [],
      renderer: { isSoftwareRasterizer: true },
      tampered: []
    };
    const telemetryHeader = encodeProbeTelemetry(suspiciousProbe, 'test_salt');

    const req = {
      method: 'GET',
      url: '/api/data',
      headers: {
        'x-barstile-telemetry': telemetryHeader
      }
    };

    const res = {
      headers: {},
      statusCode: 200,
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      getHeader(k) { return this.headers[k.toLowerCase()]; },
      end() {}
    };

    await middleware(req, res, () => {});

    assert.equal(res.statusCode, 449);
    const challenge = res.headers['x-barstile-challenge'];
    assert.ok(challenge);
    const difficultyIssued = Number.parseInt(challenge.split('.')[1], 10);
    // Baseline was 2, but risk escalation pushed it to >= 4
    assert.ok(difficultyIssued >= 4, `Expected difficulty >= 4, got ${difficultyIssued}`);
  });
});
