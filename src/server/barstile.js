import { generateSecret } from '../core/crypto.js';
import { createChallengeToken } from '../core/challenge.js';
import { createClearanceToken, verifyClearanceToken } from '../core/clearance.js';
import { ReplayCache, AllowanceCache } from '../core/cache.js';
import { verifySolution } from '../core/verifier.js';
import { RedisReplayStore } from './redis.js';

/**
 * High-performance, zero-dependency Barstile engine for backend applications.
 */
export class Barstile {
  /**
   * @param {Object} [options]
   * @param {string} [options.secret] - HMAC secret key (defaults to auto-generated 256-bit key)
   * @param {number} [options.difficulty=4] - Required leading hex zeros (1-8)
   * @param {number} [options.ttlMs=60000] - Challenge validity window in milliseconds
   * @param {number} [options.maxCached=50000] - Maximum capacity of the default anti-replay cache
   * @param {number} [options.clearanceQuota=100] - Maximum requests allowed per clearance token (0 for unlimited)
   * @param {any} [options.allowanceStore] - Pluggable allowance store for clearance request budgeting
   * @param {any} [options.redis] - Optional Redis client instance for multi-server cluster replay defense
   * @param {Object} [options.redisOptions] - Configuration options for RedisReplayStore
   * @param {any} [options.replayStore] - Pluggable replay store or cache
   * @param {any} [options.replayCache] - Alias for replayStore
   */
  constructor(options = {}) {
    this._secret = options.secret || generateSecret();
    this.difficulty = options.difficulty !== undefined ? Math.floor(options.difficulty) : 4;
    this.ttlMs = options.ttlMs !== undefined ? Math.floor(options.ttlMs) : 60000;
    this.clearanceQuota = options.clearanceQuota !== undefined ? Math.floor(options.clearanceQuota) : 100;

    if (options.redis) {
      this.replayCache = options.redis instanceof RedisReplayStore
        ? options.redis
        : new RedisReplayStore(options.redis, options.redisOptions);
    } else {
      this.replayCache = options.replayStore || options.replayCache || new ReplayCache({
        maxSize: options.maxCached || 50000
      });
    }

    this.allowanceStore = options.allowanceStore || (
      typeof this.replayCache.consume === 'function'
        ? this.replayCache
        : new AllowanceCache({ maxSize: options.maxCached || 50000 })
    );
  }

  /**
   * Generates an HMAC-signed challenge token.
   *
   * @param {Object} [overrides]
   * @param {number} [overrides.difficulty] - Override default difficulty
   * @param {number} [overrides.ttlMs] - Override default TTL
   * @param {string} [overrides.context] - Optional cryptographic client context (e.g. client fingerprint)
   * @returns {string} Signed challenge token string
   */
  issueChallenge(overrides = {}) {
    return createChallengeToken({
      secret: this._secret,
      difficulty: overrides.difficulty !== undefined ? overrides.difficulty : this.difficulty,
      ttlMs: overrides.ttlMs !== undefined ? overrides.ttlMs : this.ttlMs,
      context: overrides.context || ''
    });
  }

  /**
   * Verifies a client's solution.
   *
   * @param {string | Object} solution - Solution string ("token:nonce") or object
   * @param {Object | number} [options] - Verification options or timestamp
   * @param {string} [options.context] - Optional cryptographic client context
   * @param {number} [options.now] - Verification timestamp
   * @returns {{ valid: boolean, reason?: string, hash?: string, difficulty?: number, nonce?: number } | Promise<{ valid: boolean, reason?: string, hash?: string, difficulty?: number, nonce?: number }>}
   */
  verify(solution, options = {}) {
    const now = typeof options === 'number' ? options : (options.now || Date.now());
    const context = typeof options === 'object' ? (options.context || '') : '';
    const minDifficulty = typeof options === 'object' ? options.minDifficulty : undefined;
    return verifySolution({
      solution,
      secret: this._secret,
      replayCache: this.replayCache,
      now,
      context,
      minDifficulty
    });
  }

  /**
   * Generates an HMAC-signed clearance token.
   *
   * @param {number} [ttlMs=900000] - Duration in ms (default: 15 minutes)
   * @param {string} [context=''] - Optional cryptographic context binding (e.g. client fingerprint)
   * @returns {string} Signed clearance token
   */
  issueClearance(ttlMs = 900000, context = '') {
    return createClearanceToken({
      secret: this._secret,
      ttlMs,
      context
    });
  }

  /**
   * Verifies an HMAC-signed clearance token.
   *
   * @param {string} token - Clearance token
   * @param {number | { now?: number, context?: string }} [options=Date.now()]
   * @param {string} [context=''] - Fallback context string if options is number
   * @returns {{ valid: boolean, reason?: string, expiresAt?: number, issuedAt?: number }}
   */
  verifyClearance(token, options = Date.now(), context = '') {
    let opts = options;
    if (typeof options === 'number') {
      opts = { now: options, context: typeof context === 'string' ? context : '' };
    } else if (typeof options === 'string') {
      opts = { now: Date.now(), context: options };
    }
    return verifyClearanceToken(token, this._secret, opts);
  }

  /**
   * Consumes one request from a clearance token's allowance budget.
   *
   * @param {string} signature - Unique clearance signature
   * @param {number} [maxQuota] - Custom quota limit (defaults to this.clearanceQuota)
   * @param {number} [expiresAt] - Expiration timestamp in milliseconds
   * @returns {{ allowed: boolean, remaining: number, count: number } | Promise<{ allowed: boolean, remaining: number, count: number }>}
   */
  consumeClearance(signature, maxQuota, expiresAt) {
    const quota = maxQuota !== undefined ? maxQuota : this.clearanceQuota;
    if (quota <= 0 || !this.allowanceStore || typeof this.allowanceStore.consume !== 'function') {
      return { allowed: true, remaining: Infinity, count: 0 };
    }
    const exp = typeof expiresAt === 'number' ? expiresAt : Date.now() + 900_000;
    const ttlSeconds = Math.max(1, Math.ceil((exp - Date.now()) / 1000));
    return this.allowanceStore.consume(signature, quota, ttlSeconds, exp);
  }

  /**
   * Returns current active replay cache size.
   * @returns {number}
   */
  get cacheSize() {
    return this.replayCache.size || 0;
  }

  /**
   * Disposes of timers and clears internal state.
   */
  destroy() {
    if (typeof this.replayCache.destroy === 'function') {
      this.replayCache.destroy();
    }
    if (this.allowanceStore && this.allowanceStore !== this.replayCache && typeof this.allowanceStore.destroy === 'function') {
      this.allowanceStore.destroy();
    }
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
