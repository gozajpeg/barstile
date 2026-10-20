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
