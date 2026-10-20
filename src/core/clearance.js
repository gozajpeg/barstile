import { hmacSign, hmacVerify } from './crypto.js';

/**
 * Creates a signed clearance token indicating a client has verified their computational proof.
 * Format: "issuedAt.expiresAt.signature"
 *
 * @param {Object} options
 * @param {string} options.secret - HMAC secret key
 * @param {number} [options.ttlMs=900000] - Clearance duration in milliseconds (default: 15 minutes)
 * @param {number} [options.now=Date.now()]
 * @returns {string} Signed clearance token
 */
export function createClearanceToken({ secret, ttlMs = 900000, now = Date.now() }) {
  if (!secret || typeof secret !== 'string') {
    throw new TypeError('barstile: secret must be a non-empty string');
  }

  const issuedAt = Math.floor(now);
  const expiresAt = issuedAt + Math.max(1000, Math.floor(ttlMs));
  const payload = `${issuedAt}:${expiresAt}`;
  const signature = hmacSign(payload, secret);

  return `${issuedAt}.${expiresAt}.${signature}`;
}

/**
 * Verifies that a clearance token is cryptographically authentic and not expired.
 *
 * @param {string} token
 * @param {string} secret
 * @param {number} [now=Date.now()]
 * @returns {{ valid: boolean, reason?: string, expiresAt?: number, issuedAt?: number }}
 */
export function verifyClearanceToken(token, secret, now = Date.now()) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'malformed_clearance' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: 'malformed_clearance' };
  }

  const [issuedAtStr, expiresAtStr, signature] = parts;
  const issuedAt = Number.parseInt(issuedAtStr, 10);
  const expiresAt = Number.parseInt(expiresAtStr, 10);

  if (Number.isNaN(issuedAt) || Number.isNaN(expiresAt) || !signature) {
    return { valid: false, reason: 'malformed_clearance' };
  }

  if (now > expiresAt) {
    return { valid: false, reason: 'clearance_expired' };
  }

  const payload = `${issuedAt}:${expiresAt}`;
  const isValidSig = hmacVerify(payload, secret, signature);

  if (!isValidSig) {
    return { valid: false, reason: 'invalid_clearance_signature' };
  }

  return {
    valid: true,
    issuedAt,
    expiresAt
  };
}
