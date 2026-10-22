import { hmacSign, hmacVerify, randomSalt } from './crypto.js';
import { parseChallengeToken } from './token.js';

export { parseChallengeToken };

/**
 * Creates and signs a new challenge token.
 * Format: "salt.difficulty.expiresAt.signature"
 *
 * @param {Object} options
 * @param {string} options.secret - HMAC secret key
 * @param {number} [options.difficulty=4] - Number of leading hex zeros required (1-8)
 * @param {number} [options.ttlMs=60000] - Expiration window in milliseconds
 * @param {string} [options.salt] - Optional custom salt
 * @param {string} [options.context] - Optional cryptographic client context (e.g. IP subnet/UA)
 * @returns {string} Signed challenge token
 */
export function createChallengeToken({ secret, difficulty = 4, ttlMs = 60000, salt, context = '' }) {
  if (!secret || typeof secret !== 'string') {
    throw new TypeError('barstile: secret must be a non-empty string');
  }

  const numericDifficulty = Math.max(1, Math.min(8, Math.floor(difficulty)));
  const expiresAt = Date.now() + Math.max(1000, Math.floor(ttlMs));
  const challengeSalt = salt || randomSalt(16);

  const payload = context
    ? `${challengeSalt}:${numericDifficulty}:${expiresAt}:${context}`
    : `${challengeSalt}:${numericDifficulty}:${expiresAt}`;
  const signature = hmacSign(payload, secret);

  return `${challengeSalt}.${numericDifficulty}.${expiresAt}.${signature}`;
}

/**
 * Verifies that a challenge token has a valid HMAC signature and has not expired.
 *
 * @param {string} token
 * @param {string} secret
 * @param {number | { now?: number, context?: string }} [options=Date.now()]
 * @returns {{ valid: boolean, reason?: string, data?: { salt: string, difficulty: number, expiresAt: number, signature: string } }}
 */
export function verifyChallengeToken(token, secret, options = {}) {
  const now = typeof options === 'number' ? options : (options?.now || Date.now());
  const context = typeof options === 'object' && options !== null
    ? (options.context || '')
    : (typeof options === 'string' ? options : '');

  const parsed = parseChallengeToken(token);
  if (!parsed) {
    return { valid: false, reason: 'malformed_challenge' };
  }

  const { salt, difficulty, expiresAt, signature } = parsed;

  if (now > expiresAt) {
    return { valid: false, reason: 'challenge_expired' };
  }

  const payload = context
    ? `${salt}:${difficulty}:${expiresAt}:${context}`
    : `${salt}:${difficulty}:${expiresAt}`;
  const isValidSig = hmacVerify(payload, secret, signature);

  if (!isValidSig) {
    return { valid: false, reason: 'invalid_signature' };
  }

  return {
    valid: true,
    data: { salt, difficulty, expiresAt, signature }
  };
}
