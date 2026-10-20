import { sha256 } from './crypto.js';
import { verifyChallengeToken } from './challenge.js';

/**
 * Parses solution input into challenge token and integer nonce.
 * Supports:
 * - String format: "challengeToken:nonce"
 * - Object format: { challenge: "...", nonce: 1234 }
 *
 * @param {string | { challenge: string, nonce: number | string }} solution
 * @returns {{ token: string, nonce: number } | null}
 */
export function parseSolution(solution) {
  if (!solution) return null;

  if (typeof solution === 'string') {
    const colonIdx = solution.lastIndexOf(':');
    if (colonIdx === -1) return null;
    const token = solution.slice(0, colonIdx);
    const nonce = Number(solution.slice(colonIdx + 1));
    return !token || Number.isNaN(nonce) || nonce < 0 ? null : { token, nonce };
  }

  if (typeof solution === 'object') {
    const token = solution.challenge;
    const nonce = Number(solution.nonce);
    return typeof token !== 'string' || Number.isNaN(nonce) || nonce < 0 ? null : { token, nonce };
  }

  return null;
}

/**
 * Verifies a Proof-of-Work solution against the server secret and replay cache.
 *
 * @param {Object} params
 * @param {string | Object} params.solution - The solution token from client
 * @param {string} params.secret - Server HMAC secret
 * @param {import('./replay-cache.js').ReplayCache} [params.replayCache] - Cache to guard against replay attacks
 * @param {number} [params.now=Date.now()]
 * @returns {{ valid: boolean, reason?: string, hash?: string, difficulty?: number, nonce?: number }}
 */
export function verifySolution({ solution, secret, replayCache, now = Date.now() }) {
  const parsed = parseSolution(solution);
  if (!parsed) {
    return { valid: false, reason: 'malformed_solution' };
  }

  const { token, nonce } = parsed;

  // 1. Verify token HMAC signature and expiration
  const tokenResult = verifyChallengeToken(token, secret, now);
  if (!tokenResult.valid) {
    return { valid: false, reason: tokenResult.reason };
  }

  const { salt, difficulty, expiresAt, signature } = tokenResult.data;

  // 2. Check for replay attack
  const replayKey = `${signature}:${nonce}`;
  if (replayCache && replayCache.has(replayKey)) {
    return { valid: false, reason: 'replay_detected' };
  }

  // 3. Verify Proof-of-Work (Single SHA-256 hash operation)
  const hash = sha256(`${salt}:${nonce}`);
  const targetPrefix = '0'.repeat(difficulty);

  if (!hash.startsWith(targetPrefix)) {
    return { valid: false, reason: 'invalid_work', hash };
  }

  // 4. Record in replay cache
  if (replayCache) {
    replayCache.add(replayKey, expiresAt);
  }

  return {
    valid: true,
    hash,
    difficulty,
    nonce
  };
}
