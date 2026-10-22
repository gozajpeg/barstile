import { ReplayCache, AllowanceCache } from '../core/cache.js';

/**
 * Universal Redis adapter for Barstile replay protection and clearance quotas in clusters.
 * Compatible with ioredis, @redis/client, and any client with standard .set() and .incr() methods.
 *
 * Uses atomic Redis commands (SET ... NX, INCR) to prevent race conditions across pods.
 */
export class RedisReplayStore {
  /**
   * @param {any} client - Redis client instance (ioredis, @redis/client, etc.)
   * @param {Object} [options]
   * @param {string} [options.prefix='barstile:replay:'] - Redis key prefix
   * @param {boolean} [options.fallbackToMemory=true] - Fall back to local memory if Redis errors
   */
  constructor(client, options = {}) {
    if (!client || typeof client.set !== 'function') {
      throw new TypeError('barstile: RedisReplayStore requires a redis client instance with a .set() method (e.g. from ioredis or redis)');
    }

    this.client = client;
    this.prefix = options.prefix || 'barstile:replay:';
    this.fallbackToMemory = options.fallbackToMemory !== false;
    this.localFallback = this.fallbackToMemory ? new ReplayCache() : null;
    this.localAllowanceFallback = this.fallbackToMemory ? new AllowanceCache() : null;
  }

  /**
   * Atomically checks if a replay key exists; if not, registers it with expiration.
   *
   * @param {string} key - Unique solution identifier (signature:nonce)
   * @param {number} [ttlSecondsOrExpiresAt] - Time-to-live in seconds or absolute timestamp in ms
   * @param {number} [expiresAt] - Optional explicit absolute timestamp in ms
   * @returns {Promise<boolean>} True if newly registered, false if already present (replay detected)
   */
  async checkAndAdd(key, ttlSecondsOrExpiresAt, expiresAt) {
    const fullKey = `${this.prefix}${key}`;
    let ttl = 60;
    if (typeof ttlSecondsOrExpiresAt === 'number') {
      if (ttlSecondsOrExpiresAt < 1_000_000_000_000) {
        ttl = Math.max(1, Math.floor(ttlSecondsOrExpiresAt));
      } else {
        ttl = Math.max(1, Math.ceil((ttlSecondsOrExpiresAt - Date.now()) / 1000));
      }
    } else if (typeof expiresAt === 'number') {
      ttl = Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));
    }

    try {
      let reply;
      try {
        // Standard Redis syntax: SET key 1 EX ttl NX (supported by ioredis and node-redis)
        reply = await this.client.set(fullKey, '1', 'EX', ttl, 'NX');
      } catch {
        // Fallback for node-redis v4 options object syntax: SET key 1 { EX, NX }
        reply = await this.client.set(fullKey, '1', { EX: ttl, NX: true });
      }

      return reply === 'OK' || reply === true || reply === 1;
    } catch (err) {
      if (this.fallbackToMemory && this.localFallback) {
        const fallbackExpiresAt = Date.now() + ttl * 1000;
        return this.localFallback.checkAndAdd(key, fallbackExpiresAt);
      }
      throw err;
    }
  }

  /**
   * Checks if an identifier exists in Redis.
   *
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    const fullKey = `${this.prefix}${key}`;
    try {
      if (typeof this.client.exists === 'function') {
        const count = await this.client.exists(fullKey);
        return count > 0;
      }
      const val = await this.client.get(fullKey);
      return val !== null && val !== undefined;
    } catch (err) {
      if (this.fallbackToMemory && this.localFallback) {
        return this.localFallback.has(key);
      }
      throw err;
    }
  }

  /**
   * Adds an identifier to Redis until expiration.
   *
   * @param {string} key
   * @param {number} expiresAt - Absolute timestamp in milliseconds
   * @returns {Promise<void>}
   */
  async add(key, expiresAt) {
    const ttlSeconds = Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));
    await this.checkAndAdd(key, ttlSeconds);
  }

  /**
   * Atomically increments request counter in Redis and evaluates against clearance quota.
   *
   * @param {string} key - Unique clearance session identifier
   * @param {number} maxQuota - Maximum allowed requests (0 or negative for unlimited)
   * @param {number} [ttlSecondsOrExpiresAt] - TTL in seconds or absolute timestamp in ms
   * @param {number} [expiresAt] - Optional explicit absolute timestamp in ms
   * @returns {Promise<{ allowed: boolean, remaining: number, count: number }>}
   */
  async consume(key, maxQuota, ttlSecondsOrExpiresAt, expiresAt) {
    const fullKey = `${this.prefix}allowance:${key}`;
    let ttl = 900;
    if (typeof ttlSecondsOrExpiresAt === 'number') {
      if (ttlSecondsOrExpiresAt < 1_000_000_000_000) {
        ttl = Math.max(1, Math.floor(ttlSecondsOrExpiresAt));
      } else {
        ttl = Math.max(1, Math.ceil((ttlSecondsOrExpiresAt - Date.now()) / 1000));
      }
    } else if (typeof expiresAt === 'number') {
      ttl = Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));
    }

    try {
      const count = await this.client.incr(fullKey);
      if (count === 1) {
        await this.client.expire(fullKey, ttl);
      }

      const allowed = maxQuota <= 0 || count <= maxQuota;
      return {
        allowed,
        remaining: maxQuota <= 0 ? Infinity : Math.max(0, maxQuota - count),
        count
      };
    } catch (err) {
      if (this.fallbackToMemory && this.localAllowanceFallback) {
        return this.localAllowanceFallback.consume(key, maxQuota, ttlSecondsOrExpiresAt, expiresAt);
      }
      throw err;
    }
  }

  /**
   * Cleans up local timers if memory fallback is active.
   */
  destroy() {
    if (this.localFallback && typeof this.localFallback.destroy === 'function') {
      this.localFallback.destroy();
    }
    if (this.localAllowanceFallback && typeof this.localAllowanceFallback.destroy === 'function') {
      this.localAllowanceFallback.destroy();
    }
  }
}
