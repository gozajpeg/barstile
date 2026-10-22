/**
 * Memory-bounded replay cache with automatic TTL pruning.
 * Mitigates replay attacks by caching spent solutions until expiration or LRU eviction.
 */
export class ReplayCache {
  /**
   * @param {Object} [options]
   * @param {number} [options.maxSize=50000] - Maximum number of entries before oldest is evicted
   * @param {number} [options.pruneIntervalMs=30000] - Periodic cleanup sweep interval
   */
  constructor({ maxSize = 50000, pruneIntervalMs = 30000 } = {}) {
    this.maxSize = maxSize;
    /** @type {Map<string, number>} key -> expiresAt */
    this.entries = new Map();

    if (pruneIntervalMs > 0) {
      this.timer = setInterval(() => this.prune(), pruneIntervalMs);
      if (typeof this.timer?.unref === 'function') {
        this.timer.unref();
      }
    }
  }

  /**
   * Checks if an identifier has already been recorded in the cache.
   * Automatically clears expired entries encountered during lookup.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    const expiresAt = this.entries.get(key);
    if (expiresAt === undefined) return false;

    if (Date.now() > expiresAt) {
      this.entries.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Adds an identifier to the cache until its expiration timestamp.
   * Evicts the oldest entry if maxSize is reached.
   * @param {string} key
   * @param {number} expiresAt
   */
  add(key, expiresAt) {
    if (this.entries.size >= this.maxSize) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey !== undefined) {
        this.entries.delete(oldestKey);
      }
    }
    this.entries.set(key, expiresAt);
  }

  /**
   * Atomically checks if key is already in cache; if not, adds it.
   *
   * @param {string} key
   * @param {number} [ttlSecondsOrExpiresAt] - TTL in seconds or absolute expiresAt in ms
   * @param {number} [expiresAt] - Optional explicit absolute expiresAt in ms
   * @returns {boolean} True if newly added, false if already present
   */
  checkAndAdd(key, ttlSecondsOrExpiresAt, expiresAt) {
    let expiry = expiresAt;
    if (typeof expiry !== 'number') {
      if (typeof ttlSecondsOrExpiresAt === 'number') {
        expiry = ttlSecondsOrExpiresAt > 1_000_000_000_000
          ? ttlSecondsOrExpiresAt
          : Date.now() + ttlSecondsOrExpiresAt * 1000;
      } else {
        expiry = Date.now() + 60000;
      }
    }

    if (this.has(key)) {
      return false;
    }
    this.add(key, expiry);
    return true;
  }

  /**
   * Removes all entries whose expiration timestamp has passed.
   * @param {number} [now=Date.now()]
   * @returns {number} Count of pruned entries
   */
  prune(now = Date.now()) {
    let pruned = 0;
    for (const [key, expiresAt] of this.entries.entries()) {
      if (now > expiresAt) {
        this.entries.delete(key);
        pruned += 1;
      }
    }
    return pruned;
  }

  /**
   * Returns current active entry count.
   * @returns {number}
   */
  get size() {
    return this.entries.size;
  }

  /**
   * Clears the cache and cancels the background interval.
   */
  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.entries.clear();
  }
}

/**
 * Memory-bounded allowance cache to enforce clearance request budgets.
 * Tracks request counts per clearance token until expiration or LRU eviction.
 */
export class AllowanceCache {
  /**
   * @param {Object} [options]
   * @param {number} [options.maxSize=50000] - Maximum tracked sessions before oldest is evicted
   * @param {number} [options.pruneIntervalMs=30000] - Periodic cleanup sweep interval
   */
  constructor({ maxSize = 50000, pruneIntervalMs = 30000 } = {}) {
    this.maxSize = maxSize;
    /** @type {Map<string, { count: number, expiresAt: number }>} */
    this.entries = new Map();

    if (pruneIntervalMs > 0) {
      this.timer = setInterval(() => this.prune(), pruneIntervalMs);
      if (typeof this.timer?.unref === 'function') {
        this.timer.unref();
      }
    }
  }

  /**
   * Increments and evaluates request count for a clearance key against a max quota.
   *
   * @param {string} key - Unique clearance session identifier
   * @param {number} maxQuota - Maximum allowed requests (0 or negative for unlimited)
   * @param {number} [ttlSecondsOrExpiresAt] - TTL in seconds or absolute timestamp in ms
   * @param {number} [expiresAt] - Optional explicit absolute timestamp in ms
   * @returns {{ allowed: boolean, remaining: number, count: number }}
   */
  consume(key, maxQuota, ttlSecondsOrExpiresAt, expiresAt) {
    let expiry = expiresAt;
    if (typeof expiry !== 'number') {
      if (typeof ttlSecondsOrExpiresAt === 'number') {
        expiry = ttlSecondsOrExpiresAt > 1_000_000_000_000
          ? ttlSecondsOrExpiresAt
          : Date.now() + ttlSecondsOrExpiresAt * 1000;
      } else {
        expiry = Date.now() + 900_000;
      }
    }

    const now = Date.now();
    const existing = this.entries.get(key);

    if (!existing || now > existing.expiresAt) {
      if (this.entries.size >= this.maxSize) {
        const oldestKey = this.entries.keys().next().value;
        if (oldestKey !== undefined) {
          this.entries.delete(oldestKey);
        }
      }
      this.entries.set(key, { count: 1, expiresAt: expiry });
      const allowed = maxQuota <= 0 || 1 <= maxQuota;
      return {
        allowed,
        remaining: maxQuota <= 0 ? Infinity : Math.max(0, maxQuota - 1),
        count: 1
      };
    }

    if (maxQuota > 0 && existing.count >= maxQuota) {
      return {
        allowed: false,
        remaining: 0,
        count: existing.count
      };
    }

    existing.count += 1;
    return {
      allowed: true,
      remaining: maxQuota <= 0 ? Infinity : Math.max(0, maxQuota - existing.count),
      count: existing.count
    };
  }

  /**
   * Removes all entries whose expiration timestamp has passed.
   * @param {number} [now=Date.now()]
   * @returns {number} Count of pruned entries
   */
  prune(now = Date.now()) {
    let pruned = 0;
    for (const [key, entry] of this.entries.entries()) {
      if (now > entry.expiresAt) {
        this.entries.delete(key);
        pruned += 1;
      }
    }
    return pruned;
  }

  /**
   * Returns current active entry count.
   * @returns {number}
   */
  get size() {
    return this.entries.size;
  }

  /**
   * Clears the cache and cancels background intervals.
   */
  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.entries.clear();
  }
}
