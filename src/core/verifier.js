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
 * @param {import('./cache.js').ReplayCache} [params.replayCache] - Cache to guard against replay attacks
 * @param {number | { now?: number, context?: string }} [params.now=Date.now()]
 * @param {string} [params.context=''] - Optional cryptographic client context
 * @returns {{ valid: boolean, reason?: string, hash?: string, difficulty?: number, nonce?: number } | Promise<{ valid: boolean, reason?: string, hash?: string, difficulty?: number, nonce?: number }>}
 */
export function verifySolution({ solution, secret, replayCache, now = Date.now(), context = '', minDifficulty }) {
  const parsed = parseSolution(solution);
  if (!parsed) {
    return { valid: false, reason: 'malformed_solution' };
  }

  const { token, nonce } = parsed;

  const nowMs = typeof now === 'number' ? now : (now?.now || Date.now());
  const ctxVal = typeof now === 'object' && now !== null ? (now.context || context) : context;
  const minDiffVal = typeof now === 'object' && now !== null && typeof now.minDifficulty === 'number'
    ? now.minDifficulty
    : (typeof minDifficulty === 'number' ? minDifficulty : 0);

  const tokenResult = verifyChallengeToken(token, secret, { now: nowMs, context: ctxVal });
  if (!tokenResult.valid) {
    return { valid: false, reason: tokenResult.reason };
  }

  const { salt, difficulty, expiresAt, signature } = tokenResult.data;

  if (minDiffVal > 0 && difficulty < minDiffVal) {
    return { valid: false, reason: 'insufficient_difficulty', difficulty, requiredDifficulty: minDiffVal };
  }

  const hash = sha256(`${salt}:${nonce}`);
  const targetPrefix = '0'.repeat(difficulty);

  if (!hash.startsWith(targetPrefix)) {
    return { valid: false, reason: 'invalid_work', hash };
  }

  const replayKey = `${signature}:${nonce}`;
  const ttlSeconds = Math.max(1, Math.ceil((expiresAt - nowMs) / 1000));

  if (replayCache) {
    if (typeof replayCache.checkAndAdd === 'function') {
      const isNew = replayCache.checkAndAdd(replayKey, ttlSeconds, expiresAt);
      if (isNew && typeof isNew.then === 'function') {
        return isNew.then((accepted) => {
          if (!accepted) return { valid: false, reason: 'replay_detected' };
          return { valid: true, hash, difficulty, nonce };
        });
      }
      if (!isNew) {
        return { valid: false, reason: 'replay_detected' };
      }
    } else {
      if (typeof replayCache.has === 'function' && replayCache.has(replayKey)) {
        return { valid: false, reason: 'replay_detected' };
      }
      if (typeof replayCache.add === 'function') {
        replayCache.add(replayKey, expiresAt);
      }
    }
  }

  return {
    valid: true,
    hash,
    difficulty,
    nonce
  };
}
