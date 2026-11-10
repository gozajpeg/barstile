import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as serverExports from '../src/server/index.js';
import * as clientExports from '../src/client/index.js';
import * as rootExports from '../src/index.js';

describe('Documentation and Export Synchronization', () => {
  test('server exports match documented server API interface', () => {
    const requiredServerSymbols = [
      'Barstile',
      'createBarstile',
      'barstileMiddleware',
      'verifySolution',
      'parseSolution',
      'createChallengeToken',
      'parseChallengeToken',
      'verifyChallengeToken',
      'createClearanceToken',
      'verifyClearanceToken',
      'ReplayCache',
      'AllowanceCache',
      'TarpitTracker',
      'RedisReplayStore',
      'generateSecret',
      'sha256',
      'hmacSign',
      'hmacVerify',
      'randomSalt',
      'extractClientIp',
      'normalizeIpSubnet',
      'getClientFingerprint',
      'resolveRouteConfig',
      'extractPathname'
    ];

    for (const sym of requiredServerSymbols) {
      assert.ok(
        sym in serverExports,
        `Expected symbol "${sym}" to be exported by barstile/server`
      );
    }
  });

  test('client exports match documented client API interface', () => {
    const requiredClientSymbols = [
      'barstileFetch',
      'renderWidget',
      'autoInitializeWidgets',
      'collectBrowserProbe',
      'createBehaviorTracker',
      'solve',
      'solveSync',
      'solveWorker',
      'isWebWorkerSupported',
      'sha256Sync',
      'parseChallengeToken',
      'clearClearance',
      'getActiveClearance'
    ];

    for (const sym of requiredClientSymbols) {
      assert.ok(
        sym in clientExports,
        `Expected symbol "${sym}" to be exported by barstile/client`
      );
    }
  });

  test('root package exports contain full set of server and client functions', () => {
    assert.ok(typeof rootExports.barstileMiddleware === 'function');
    assert.ok(typeof rootExports.createBarstile === 'function');
    assert.ok(typeof rootExports.barstileFetch === 'function');
    assert.ok(typeof rootExports.renderWidget === 'function');
    assert.ok(typeof rootExports.solve === 'function');
    assert.ok(typeof rootExports.solveWorker === 'function');
  });

  test('renderWidget and autoInitializeWidgets have correct function signatures', () => {
    assert.equal(typeof clientExports.renderWidget, 'function');
    assert.equal(clientExports.renderWidget.length, 1); // target, options = {}

    assert.equal(typeof clientExports.autoInitializeWidgets, 'function');
    assert.equal(clientExports.autoInitializeWidgets.length, 0);
  });

  test('package.json enforces zero runtime dependencies and exports map integrity', async () => {
    const fs = await import('node:fs');
    const pkgPath = new URL('../package.json', import.meta.url);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    assert.deepEqual(pkg.dependencies, {}, 'barstile must have strictly zero runtime dependencies');
    assert.ok(pkg.exports['.'], 'Must export main bundle');
    assert.ok(pkg.exports['./server'], 'Must export server bundle');
    assert.ok(pkg.exports['./client'], 'Must export client bundle');
    assert.ok(pkg.exports['./react'], 'Must export React component');
    assert.ok(pkg.exports['./web-component'], 'Must export web component');
  });

  test('markdown documentation contains zero em or en dashes', async () => {
    const fs = await import('node:fs');
    const docFiles = [
      '../README.md',
      '../docs/API.md',
      '../docs/ARCHITECTURE.md',
      '../docs/SECURITY.md'
    ];

    for (const file of docFiles) {
      const fullUrl = new URL(file, import.meta.url);
      if (fs.existsSync(fullUrl)) {
        const content = fs.readFileSync(fullUrl, 'utf8');
        assert.equal(content.includes('\u2014'), false, `File ${file} must not contain em dash`);
        assert.equal(content.includes('\u2013'), false, `File ${file} must not contain en dash`);
      }
    }
  });
});
