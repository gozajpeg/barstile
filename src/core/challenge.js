import { hmacSign, hmacVerify, randomSalt } from './crypto.js';

/**
 * Creates and signs a new challenge token.
 * Format: "salt.difficulty.expiresAt.signature"
 *
 * @param {Object} options
 * @param {string} options.secret - HMAC secret key
 * @param {number} [options.difficulty=4] - Number of leading hex zeros required (1-8)
 * @param {number} [options.ttlMs=60000] - Expiration window in milliseconds
 * @param {string} [options.salt] - Optional custom salt
 * @returns {string} Signed challenge token
 */
export function createChallengeToken({ secret, difficulty = 4, ttlMs = 60000, salt }) {
  if (!secret || typeof secret !== 'string') {
    throw new TypeError('barstile: secret must be a non-empty string');
  }

  const numericDifficulty = Math.max(1, Math.min(8, Math.floor(difficulty)));
  const expiresAt = Date.now() + Math.max(1000, Math.floor(ttlMs));
  const challengeSalt = salt || randomSalt(16);

  const payload = `${challengeSalt}:${numericDifficulty}:${expiresAt}`;
  const signature = hmacSign(payload, secret);

  return `${challengeSalt}.${numericDifficulty}.${expiresAt}.${signature}`;
}

/**
 * Parses and validates the structural components of a challenge token.
 *
 * @param {string} token
 * @returns {{ salt: string, difficulty: number, expiresAt: number, signature: string } | null}
 */
export function parseChallengeToken(token) {
  if (typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 4) return null;

  const [salt, diffStr, expStr, signature] = parts;
  const difficulty = Number.parseInt(diffStr, 10);
  const expiresAt = Number.parseInt(expStr, 10);

  if (
    !salt ||
    !signature ||
    Number.isNaN(difficulty) ||
    difficulty < 1 ||
    difficulty > 8 ||
    Number.isNaN(expiresAt) ||
    expiresAt <= 0
  ) {
    return null;
  }

  return { salt, difficulty, expiresAt, signature };
}

/**
 * Verifies that a challenge token has a valid HMAC signature and has not expired.
 *
 * @param {string} token
 * @param {string} secret
 * @param {number} [now=Date.now()]
 * @returns {{ valid: boolean, reason?: string, data?: { salt: string, difficulty: number, expiresAt: number, signature: string } }}
 */
export function verifyChallengeToken(token, secret, now = Date.now()) {
  const parsed = parseChallengeToken(token);
  if (!parsed) {
    return { valid: false, reason: 'malformed_challenge' };
  }

  const { salt, difficulty, expiresAt, signature } = parsed;

  if (now > expiresAt) {
    return { valid: false, reason: 'challenge_expired' };
  }

  const payload = `${salt}:${difficulty}:${expiresAt}`;
  const isValidSig = hmacVerify(payload, secret, signature);

  if (!isValidSig) {
    return { valid: false, reason: 'invalid_signature' };
  }

  return {
    valid: true,
    data: { salt, difficulty, expiresAt, signature }
  };
}
