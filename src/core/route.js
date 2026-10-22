/**
 * Extracts a normalized pathname from an incoming HTTP request.
 * Strips query strings and trailing slashes for consistent route matching.
 *
 * @param {any} req
 * @returns {string}
 */
export function extractPathname(req) {
  if (!req) return '/';
  const rawUrl = req.originalUrl || req.url || req.path || '/';
  if (typeof rawUrl !== 'string') return '/';

  const queryIdx = rawUrl.indexOf('?');
  const hashIdx = rawUrl.indexOf('#');
  let end = rawUrl.length;
  if (queryIdx !== -1) end = Math.min(end, queryIdx);
  if (hashIdx !== -1) end = Math.min(end, hashIdx);

  const sliced = rawUrl.slice(0, end) || '/';
  return sliced.length > 1 && sliced.endsWith('/') ? sliced.slice(0, -1) : sliced;
}

/**
 * Resolves the effective difficulty and clearance settings for an incoming request
 * based on route-specific overrides, dynamic difficulty functions, or global defaults.
 *
 * @param {any} req - Incoming HTTP request
 * @param {Object} [options]
 * @param {number | ((req: any) => number)} [options.difficulty=4]
 * @param {boolean} [options.clearance=true]
 * @param {number} [options.clearanceQuota=100]
 * @param {Record<string, number | { difficulty?: number, clearance?: boolean, clearanceQuota?: number }>} [options.routes]
 * @returns {{ difficulty: number, clearance: boolean, clearanceQuota: number }}
 */
export function resolveRouteConfig(req, options = {}) {
  const baseDifficulty = typeof options.difficulty === 'number' ? Math.floor(options.difficulty) : 4;
  const baseClearance = options.clearance !== false;
  const baseQuota = options.clearanceQuota !== undefined ? Math.floor(options.clearanceQuota) : 100;

  // 1. Dynamic function evaluation: difficulty: (req) => number
  if (typeof options.difficulty === 'function') {
    try {
      const dynamicVal = options.difficulty(req);
      if (typeof dynamicVal === 'number' && !Number.isNaN(dynamicVal)) {
        return {
          difficulty: Math.max(1, Math.min(8, Math.floor(dynamicVal))),
          clearance: baseClearance,
          clearanceQuota: baseQuota
        };
      }
    } catch {
      // Fallback to base configuration if custom function throws
    }
  }

  const routes = options.routes;
  if (!routes || typeof routes !== 'object') {
    return {
      difficulty: Math.max(1, Math.min(8, baseDifficulty)),
      clearance: baseClearance,
      clearanceQuota: baseQuota
    };
  }

  const method = (req?.method || 'GET').toUpperCase();
  const path = extractPathname(req);

  for (const [pattern, rule] of Object.entries(routes)) {
    if (rule === undefined || rule === null) continue;

    const trimmed = pattern.trim();
    let ruleMethod = null;
    let rulePath = trimmed;

    // Check for HTTP method prefix: e.g. "POST /api/login"
    const spaceIdx = trimmed.indexOf(' ');
    if (spaceIdx !== -1) {
      ruleMethod = trimmed.slice(0, spaceIdx).toUpperCase();
      rulePath = trimmed.slice(spaceIdx + 1).trim();
    }

    if (ruleMethod && ruleMethod !== method) {
      continue;
    }

    if (rulePath.length > 1 && rulePath.endsWith('/') && !rulePath.endsWith('/*')) {
      rulePath = rulePath.slice(0, -1);
    }

    let isMatch = false;
    if (rulePath.endsWith('/*') || rulePath.endsWith('/**')) {
      const prefix = rulePath.replace(/\/\*+$/, '');
      isMatch = path === prefix || path.startsWith(prefix + '/');
    } else if (rulePath.endsWith('*')) {
      const prefix = rulePath.slice(0, -1);
      isMatch = path.startsWith(prefix);
    } else {
      isMatch = path === rulePath;
    }

    if (isMatch) {
      if (typeof rule === 'number') {
        return {
          difficulty: Math.max(1, Math.min(8, Math.floor(rule))),
          clearance: baseClearance,
          clearanceQuota: baseQuota
        };
      }

      if (typeof rule === 'object') {
        const diff = typeof rule.difficulty === 'number' ? rule.difficulty : baseDifficulty;
        const clr = rule.clearance !== undefined ? Boolean(rule.clearance) : baseClearance;
        const qta = rule.clearanceQuota !== undefined ? Math.floor(rule.clearanceQuota) : baseQuota;

        return {
          difficulty: Math.max(1, Math.min(8, Math.floor(diff))),
          clearance: clr,
          clearanceQuota: qta
        };
      }
    }
  }

  return {
    difficulty: Math.max(1, Math.min(8, baseDifficulty)),
    clearance: baseClearance,
    clearanceQuota: baseQuota
  };
}
