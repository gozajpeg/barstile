import { sha256 } from './crypto.js';

/**
 * Extracts client IP address from request, supporting Express, Fastify, native Node http,
 * and standard reverse proxy headers (X-Forwarded-For, X-Real-IP).
 *
 * @param {any} req - Incoming request object
 * @param {Object} [options]
 * @param {boolean} [options.trustProxy=false] - Whether to trust reverse proxy headers
 * @returns {string} Normalized IP address
 */
export function extractClientIp(req, { trustProxy = false } = {}) {
  if (!req) return '127.0.0.1';

  if (trustProxy) {
    let xForwardedFor = req.headers?.['x-forwarded-for'];
    if (Array.isArray(xForwardedFor)) {
      xForwardedFor = xForwardedFor[0];
    }
    if (typeof xForwardedFor === 'string' && xForwardedFor.length > 0) {
      const firstIp = xForwardedFor.split(',')[0].trim();
      if (firstIp) return firstIp;
    }

    let realIp = req.headers?.['x-real-ip'];
    if (Array.isArray(realIp)) {
      realIp = realIp[0];
    }
    if (typeof realIp === 'string' && realIp.trim()) {
      return realIp.trim();
    }
  }

  // Fastify / Express req.ip or raw socket address
  const socketIp =
    req.ip ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    '127.0.0.1';

  return typeof socketIp === 'string' ? socketIp : '127.0.0.1';
}

/**
 * Normalizes an IP address to its base subnet prefix to prevent legitimate mobile users
 * on carrier network pools from getting disconnected while stopping cross-datacenter sharing.
 *
 * - IPv4: Extracts /24 prefix (first 3 octets, e.g. "198.51.100")
 * - IPv6: Extracts /64 prefix (first 4 blocks, e.g. "2001:db8:abcd:12")
 * - Strips IPv4-mapped IPv6 prefixes ("::ffff:")
 *
 * @param {string} ip - Raw IP string
 * @param {boolean} [bindSubnet=true] - If false, returns exact IP
 * @returns {string} Normalized subnet or exact IP
 */
export function normalizeIpSubnet(ip, bindSubnet = true) {
  if (!ip || typeof ip !== 'string') return 'unknown_ip';

  let cleanIp = ip.trim().toLowerCase();

  // Strip IPv4-mapped IPv6 prefix
  if (cleanIp.startsWith('::ffff:')) {
    cleanIp = cleanIp.slice(7);
  }

  if (!bindSubnet) {
    return cleanIp;
  }

  // IPv4 format: a.b.c.d
  if (cleanIp.includes('.')) {
    const parts = cleanIp.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
    }
    return cleanIp;
  }

  // IPv6 format: contains ':'
  if (cleanIp.includes(':')) {
    if (cleanIp === '::1' || cleanIp === '::') {
      return '::1';
    }
    const parts = cleanIp.split(':').filter(Boolean);
    if (parts.length >= 4) {
      return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}`;
    }
    return cleanIp;
  }

  return cleanIp;
}

/**
 * Generates a compact cryptographic client fingerprint for clearance token binding.
 *
 * @param {any} req - Incoming request object
 * @param {Object} [options]
 * @param {boolean} [options.bindIp=true] - Bind to client IP or subnet
 * @param {boolean} [options.bindSubnet=true] - Use /24 IPv4 or /64 IPv6 subnet for mobile stability
 * @param {boolean} [options.bindUserAgent=true] - Bind to hash of User-Agent header
 * @param {boolean} [options.trustProxy=false] - Trust reverse proxy headers
 * @returns {string} Deterministic client fingerprint string
 */
export function getClientFingerprint(req, {
  bindIp = true,
  bindSubnet = true,
  bindUserAgent = true,
  trustProxy = false
} = {}) {
  const parts = [];

  if (bindIp) {
    const rawIp = extractClientIp(req, { trustProxy });
    const subnet = normalizeIpSubnet(rawIp, bindSubnet);
    parts.push(`ip:${subnet}`);
  }

  if (bindUserAgent) {
    let ua = req?.headers?.['user-agent'];
    if (Array.isArray(ua)) {
      ua = ua.join(' ');
    } else if (typeof ua !== 'string') {
      ua = '';
    }
    const uaHash = sha256(ua).slice(0, 12);
    parts.push(`ua:${uaHash}`);
  }

  return parts.join('|');
}
