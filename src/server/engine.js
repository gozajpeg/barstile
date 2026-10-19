import { generateSecret } from '../core/crypto.js';
import { createChallengeToken } from '../core/challenge.js';
import { ReplayCache } from '../core/replay-cache.js';
import { verifySolution } from '../core/verifier.js';

/**
 * High-performance, zero-dependency Barstile engine for backend applications.
 */
export class Barstile {
  /**
   * @param {Object} [options]
   * @param {string} [options.secret] - HMAC secret key (defaults to auto-generated 256-bit key)
   * @param {number} [options.difficulty=4] - Required leading hex zeros (1-8)
   * @param {number} [options.ttlMs=60000] - Challenge validity window in milliseconds
   * @param {number} [options.maxCached=50000] - Maximum capacity of the anti-replay cache
   */
  constructor(options = {}) {
    this._secret = options.secret || generateSecret();
    this.difficulty = options.difficulty !== undefined ? Math.floor(options.difficulty) : 4;
    this.ttlMs = options.ttlMs !== undefined ? Math.floor(options.ttlMs) : 60000;
    this.replayCache = new ReplayCache({
      maxSize: options.maxCached || 50000
    });
  }

  /**
   * Generates an HMAC-signed challenge token.
   *
   * @param {Object} [overrides]
   * @param {number} [overrides.difficulty] - Override default difficulty
   * @param {number} [overrides.ttlMs] - Override default TTL
   * @returns {string} Signed challenge token string
   */
  issueChallenge(overrides = {}) {
    return createChallengeToken({
      secret: this._secret,
      difficulty: overrides.difficulty !== undefined ? overrides.difficulty : this.difficulty,
      ttlMs: overrides.ttlMs !== undefined ? overrides.ttlMs : this.ttlMs
    });
  }

  /**
   * Verifies a client's solution.
   *
   * @param {string | Object} solution - Solution string ("token:nonce") or object
   * @returns {{ valid: boolean, reason?: string, hash?: string, difficulty?: number, nonce?: number }}
   */
  verify(solution) {
    return verifySolution({
      solution,
      secret: this._secret,
      replayCache: this.replayCache
    });
  }

  /**
   * Returns current active replay cache size.
   * @returns {number}
   */
  get cacheSize() {
    return this.replayCache.size;
  }

  /**
   * Disposes of timers and clears internal state.
   */
  destroy() {
    this.replayCache.destroy();
  }
}

/**
 * Factory function to instantiate a Barstile engine instance.
 * @param {Object} [options]
 * @returns {Barstile}
 */
export function createBarstile(options) {
  return new Barstile(options);
}
