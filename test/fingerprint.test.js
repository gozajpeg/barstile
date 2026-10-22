import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { extractClientIp, normalizeIpSubnet, getClientFingerprint } from '../src/core/fingerprint.js';

describe('Cryptographic Client Fingerprinting', () => {
  describe('extractClientIp', () => {
    test('extracts direct socket address when trustProxy is false', () => {
      const req = {
        socket: { remoteAddress: '192.0.2.1' },
        headers: { 'x-forwarded-for': '203.0.113.195' }
      };
      const ip = extractClientIp(req, { trustProxy: false });
      assert.equal(ip, '192.0.2.1');
    });

    test('extracts first IP from X-Forwarded-For when trustProxy is true', () => {
      const req = {
        socket: { remoteAddress: '10.0.0.1' },
        headers: { 'x-forwarded-for': '203.0.113.195, 10.0.0.1' }
      };
      const ip = extractClientIp(req, { trustProxy: true });
      assert.equal(ip, '203.0.113.195');
    });

    test('falls back to X-Real-IP when trustProxy is true and X-Forwarded-For is absent', () => {
      const req = {
        socket: { remoteAddress: '10.0.0.1' },
        headers: { 'x-real-ip': '198.51.100.8' }
      };
      const ip = extractClientIp(req, { trustProxy: true });
      assert.equal(ip, '198.51.100.8');
    });

    test('returns 127.0.0.1 for missing request object or empty socket', () => {
      assert.equal(extractClientIp(null), '127.0.0.1');
      assert.equal(extractClientIp({}), '127.0.0.1');
    });
  });

  describe('normalizeIpSubnet', () => {
    test('extracts /24 subnet for standard IPv4 addresses', () => {
      assert.equal(normalizeIpSubnet('198.51.100.42', true), '198.51.100');
      assert.equal(normalizeIpSubnet('198.51.100.99', true), '198.51.100');
      assert.equal(normalizeIpSubnet('10.20.30.40', true), '10.20.30');
    });

    test('returns exact IP when bindSubnet is false', () => {
      assert.equal(normalizeIpSubnet('198.51.100.42', false), '198.51.100.42');
    });

    test('strips IPv4-mapped IPv6 prefix', () => {
      assert.equal(normalizeIpSubnet('::ffff:198.51.100.42', true), '198.51.100');
      assert.equal(normalizeIpSubnet('::ffff:198.51.100.42', false), '198.51.100.42');
    });

    test('extracts /64 subnet prefix for IPv6 addresses', () => {
      assert.equal(normalizeIpSubnet('2001:0db8:85a3:0000:0000:8a2e:0370:7334', true), '2001:0db8:85a3:0000');
      assert.equal(normalizeIpSubnet('::1', true), '::1');
    });
  });

  describe('getClientFingerprint', () => {
    test('creates deterministic fingerprint combining IP subnet and User-Agent hash', () => {
      const req = {
        socket: { remoteAddress: '198.51.100.42' },
        headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
      };

      const fp1 = getClientFingerprint(req);
      const fp2 = getClientFingerprint(req);

      assert.equal(fp1, fp2);
      assert.match(fp1, /^ip:198\.51\.100\|ua:[a-f0-9]{12}$/);
    });

    test('produces identical fingerprint for IPs within the same /24 subnet (mobile carrier stability)', () => {
      const reqTower1 = {
        socket: { remoteAddress: '198.51.100.12' },
        headers: { 'user-agent': 'MobileApp/1.0' }
      };
      const reqTower2 = {
        socket: { remoteAddress: '198.51.100.89' },
        headers: { 'user-agent': 'MobileApp/1.0' }
      };

      const fp1 = getClientFingerprint(reqTower1);
      const fp2 = getClientFingerprint(reqTower2);

      assert.equal(fp1, fp2);
    });

    test('produces distinct fingerprints for different subnets (cross-datacenter / botnet sharing)', () => {
      const bot1 = {
        socket: { remoteAddress: '198.51.100.12' },
        headers: { 'user-agent': 'ScraperBot/2.0' }
      };
      const bot2 = {
        socket: { remoteAddress: '203.0.113.88' },
        headers: { 'user-agent': 'ScraperBot/2.0' }
      };

      const fp1 = getClientFingerprint(bot1);
      const fp2 = getClientFingerprint(bot2);

      assert.notEqual(fp1, fp2);
    });

    test('produces distinct fingerprints for different User-Agents on same IP', () => {
      const req1 = {
        socket: { remoteAddress: '198.51.100.12' },
        headers: { 'user-agent': 'Mozilla/5.0 Chrome' }
      };
      const req2 = {
        socket: { remoteAddress: '198.51.100.12' },
        headers: { 'user-agent': 'curl/8.4.0' }
      };

      const fp1 = getClientFingerprint(req1);
      const fp2 = getClientFingerprint(req2);

      assert.notEqual(fp1, fp2);
    });

    test('allows selectively disabling IP or UA binding via options', () => {
      const req = {
        socket: { remoteAddress: '198.51.100.42' },
        headers: { 'user-agent': 'Mozilla/5.0' }
      };

      const fpNoIp = getClientFingerprint(req, { bindIp: false });
      assert.match(fpNoIp, /^ua:[a-f0-9]{12}$/);

      const fpNoUa = getClientFingerprint(req, { bindUserAgent: false });
      assert.equal(fpNoUa, 'ip:198.51.100');

      const fpNone = getClientFingerprint(req, { bindIp: false, bindUserAgent: false });
      assert.equal(fpNone, '');
    });

    test('safely handles pathological headers (arrays, numbers, missing socket)', () => {
      // Duplicate User-Agent headers parsed as Array
      const reqArrayUa = {
        socket: { remoteAddress: '198.51.100.42' },
        headers: { 'user-agent': ['Mozilla/5.0', 'curl/8.4.0'] }
      };
      assert.doesNotThrow(() => getClientFingerprint(reqArrayUa));

      // Array X-Forwarded-For
      const reqArrayXff = {
        headers: { 'x-forwarded-for': ['203.0.113.1', '10.0.0.1'] }
      };
      const ip = extractClientIp(reqArrayXff, { trustProxy: true });
      assert.equal(ip, '203.0.113.1');

      // Non-string User-Agent
      const reqNumUa = { headers: { 'user-agent': 9999 } };
      assert.doesNotThrow(() => getClientFingerprint(reqNumUa));

      // Destroyed socket / missing socket
      assert.equal(extractClientIp({ socket: null }), '127.0.0.1');
    });
  });
});
