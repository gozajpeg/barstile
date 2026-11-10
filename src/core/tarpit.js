/**
 * Memory-bounded sliding-window tarpit and IP rate limiter.
 * Limits unverified request floods, penalizes repeated verification failures,
 * and caps memory usage using LRU eviction.
 */
export class TarpitTracker {
  constructor(options = {}) {
    this.maxTrackedIps = Number.isFinite(options.maxTrackedIps) ? Math.floor(options.maxTrackedIps) : 10000;
    this.windowMs = Number.isFinite(options.windowMs) ? Math.floor(options.windowMs) : 60000;
    this.maxRequests = Number.isFinite(options.maxRequests) ? Math.floor(options.maxRequests) : 60;
    this.consecutiveFailureThreshold = Number.isFinite(options.consecutiveFailureThreshold)
      ? Math.floor(options.consecutiveFailureThreshold)
      : 5;
    this.tarpitDelayMs = Number.isFinite(options.tarpitDelayMs) ? Math.floor(options.tarpitDelayMs) : 3000;

    // Map maintains insertion order: key -> { timestamps: number[], failures: number, lastSeen: number, penalizedUntil: number }
    this.records = new Map();

    const pruneInterval = Number.isFinite(options.pruneIntervalMs) ? Math.floor(options.pruneIntervalMs) : 30000;
    if (pruneInterval > 0) {
      this.timer = setInterval(() => this.prune(), pruneInterval);
      if (typeof this.timer.unref === 'function') {
        this.timer.unref();
      }
    }
  }

  _getOrCreate(ip, now) {
    let record = this.records.get(ip);
    if (record) {
      // Re-insert to refresh LRU position
      this.records.delete(ip);
      this.records.set(ip, record);
      return record;
    }

    if (this.records.size >= this.maxTrackedIps) {
      // Evict oldest record (first item in Map iterator)
      const oldestKey = this.records.keys().next().value;
      if (oldestKey !== undefined) {
        this.records.delete(oldestKey);
      }
    }

    record = {
      timestamps: [],
      failures: 0,
      lastSeen: now,
      penalizedUntil: 0
    };
    this.records.set(ip, record);
    return record;
  }

  recordRequest(ip, now = Date.now()) {
    if (!ip) return { allowed: true, count: 0, remaining: this.maxRequests, penalized: false };

    const record = this._getOrCreate(ip, now);
    record.lastSeen = now;

    // Slide window: remove timestamps older than windowMs
    const windowStart = now - this.windowMs;
    while (record.timestamps.length > 0 && record.timestamps[0] <= windowStart) {
      record.timestamps.shift();
    }

    if (record.penalizedUntil > now) {
      return { allowed: false, count: record.timestamps.length, remaining: 0, penalized: true };
    }

    if (this.maxRequests > 0 && record.timestamps.length >= this.maxRequests) {
      return { allowed: false, count: record.timestamps.length, remaining: 0, penalized: false };
    }

    record.timestamps.push(now);
    const count = record.timestamps.length;
    const remaining = this.maxRequests > 0 ? Math.max(0, this.maxRequests - count) : Infinity;

    return { allowed: true, count, remaining, penalized: false };
  }

  recordFailure(ip, now = Date.now()) {
    if (!ip) return { penalized: false, failureCount: 0 };

    const record = this._getOrCreate(ip, now);
    record.failures += 1;
    record.lastSeen = now;

    if (record.failures >= this.consecutiveFailureThreshold) {
      record.penalizedUntil = now + this.tarpitDelayMs;
      return { penalized: true, failureCount: record.failures };
    }

    return { penalized: false, failureCount: record.failures };
  }

  recordSuccess(ip, now = Date.now()) {
    if (!ip) return;
    const record = this.records.get(ip);
    if (record) {
      record.failures = 0;
      record.penalizedUntil = 0;
      record.lastSeen = now;
      this.records.delete(ip);
      this.records.set(ip, record);
    }
  }

  isPenalized(ip, now = Date.now()) {
    if (!ip) return false;
    const record = this.records.get(ip);
    if (!record) return false;
    return record.penalizedUntil > now;
  }

  prune(now = Date.now()) {
    const windowStart = now - this.windowMs;
    for (const [ip, record] of this.records) {
      if (record.lastSeen < windowStart && record.penalizedUntil <= now) {
        this.records.delete(ip);
      }
    }
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.records.clear();
  }
}
