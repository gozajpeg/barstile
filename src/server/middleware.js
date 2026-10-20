import { Barstile } from './barstile.js';

/**
 * Appends a header to Access-Control-Expose-Headers without overwriting existing exposed headers.
 * @param {any} res
 * @param {string} headerName
 */
function appendExposeHeader(res, headerName) {
  if (typeof res.getHeader !== 'function' || typeof res.setHeader !== 'function') return;
  const existing = res.getHeader('Access-Control-Expose-Headers');
  if (!existing) {
    res.setHeader('Access-Control-Expose-Headers', headerName);
  } else {
    const list = Array.isArray(existing) ? existing.join(', ') : String(existing);
    if (!list.toLowerCase().includes(headerName.toLowerCase())) {
      res.setHeader('Access-Control-Expose-Headers', `${list}, ${headerName}`);
    }
  }
}

/**
 * Appends a Set-Cookie header without overwriting existing cookies.
 * @param {any} res
 * @param {string} cookieStr
 */
function appendSetCookie(res, cookieStr) {
  if (typeof res.getHeader !== 'function' || typeof res.setHeader !== 'function') return;
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', [cookieStr]);
  } else if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookieStr]);
  } else {
    res.setHeader('Set-Cookie', [String(existing), cookieStr]);
  }
}

/**
 * Extracts a cookie value from req.cookies or req.headers.cookie.
 * @param {any} req
 * @param {string} name
 * @returns {string | null}
 */
function extractCookie(req, name) {
  if (req.cookies && typeof req.cookies[name] === 'string') {
    return req.cookies[name];
  }
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader || typeof cookieHeader !== 'string') return null;
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const match = new RegExp('(?:^|;\\s*)' + escaped + '=([^;]+)').exec(cookieHeader);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Creates plug-and-play middleware for Express, Connect, and native Node.js HTTP servers.
 *
 * @param {Object} [options]
 * @param {Barstile} [options.barstile] - Existing Barstile engine instance
 * @param {Barstile} [options.engine] - Alias for options.barstile
 * @param {string} [options.secret] - Secret key (auto-generated if omitted)
 * @param {number} [options.difficulty=4] - Proof-of-Work difficulty (leading hex zeros)
 * @param {number} [options.ttlMs=60000] - Challenge expiration window in milliseconds
 * @param {boolean} [options.clearance=true] - Issue persistent clearance tokens to verified clients
 * @param {number} [options.clearanceTtlMs=900000] - Clearance duration in ms (default: 15 minutes)
 * @param {string} [options.clearanceHeader='x-barstile-clearance'] - Clearance header name
 * @param {string} [options.clearanceCookie='barstile_clearance'] - Clearance cookie name
 * @param {any} [options.replayCache] - Optional custom replay cache instance
 * @param {string} [options.challengeHeader='x-barstile-challenge'] - Response header containing challenge
 * @param {string} [options.solutionHeader='x-barstile-solution'] - Request header containing client solution
 * @param {number} [options.statusCode=449] - HTTP status code when PoW challenge is issued
 * @param {(req: any) => boolean} [options.shouldChallenge] - Optional filter function to conditionally enforce challenge
 * @param {(req: any, res: any, reason: string) => void} [options.onFailure] - Custom handler for verification failures
 * @returns {(req: any, res: any, next: (err?: any) => void) => void}
 */
export function barstileMiddleware(options = {}) {
  const customEngine = options.barstile || options.engine;
  const engine = customEngine instanceof Barstile
    ? customEngine
    : new Barstile({
        secret: options.secret,
        difficulty: options.difficulty,
        ttlMs: options.ttlMs,
        replayCache: options.replayCache
      });

  const challengeHeader = (options.challengeHeader || 'x-barstile-challenge').toLowerCase();
  const solutionHeader = (options.solutionHeader || 'x-barstile-solution').toLowerCase();
  const clearanceHeader = (options.clearanceHeader || 'x-barstile-clearance').toLowerCase();
  const clearanceCookie = options.clearanceCookie || 'barstile_clearance';
  const enableClearance = options.clearance !== false;
  const clearanceTtlMs = options.clearanceTtlMs || 900_000;
  const statusCode = options.statusCode || 449;

  return function middleware(req, res, next) {
    if (res.headersSent) {
      return next ? next() : undefined;
    }

    if (typeof options.shouldChallenge === 'function' && !options.shouldChallenge(req)) {
      return next ? next() : undefined;
    }

    // 1. Check for persistent clearance token (header or cookie)
    if (enableClearance) {
      const clearanceToken =
        req.headers?.[clearanceHeader] ||
        extractCookie(req, clearanceCookie);

      if (clearanceToken) {
        const clearanceRes = engine.verifyClearance(clearanceToken);
        if (clearanceRes.valid) {
          req.barstile = {
            verified: true,
            clearance: true,
            expiresAt: clearanceRes.expiresAt
          };
          return next ? next() : undefined;
        }
      }
    }

    // 2. Check for PoW solution in header, query, or body
    const solution =
      req.headers?.[solutionHeader] ||
      req.query?.barstile_solution ||
      req.body?.barstile_solution;

    if (!solution) {
      // Issue new challenge
      const challenge = engine.issueChallenge();
      res.setHeader(challengeHeader, challenge);
      appendExposeHeader(res, challengeHeader);
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json');

      const payload = JSON.stringify({
        error: 'pow_required',
        message: 'Proof of work required to pass barstile',
        challenge,
        header: challengeHeader
      });

      return res.end(payload);
    }

    // 3. Verify submitted solution
    const result = engine.verify(solution);

    if (!result.valid) {
      // Provide a fresh challenge on failure
      const freshChallenge = engine.issueChallenge();
      res.setHeader(challengeHeader, freshChallenge);
      appendExposeHeader(res, challengeHeader);

      if (typeof options.onFailure === 'function') {
        return options.onFailure(req, res, result.reason || 'invalid_solution');
      }

      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          error: 'barstile_failed',
          reason: result.reason,
          challenge: freshChallenge
        })
      );
    }

    // 4. Issue clearance token for subsequent requests
    let issuedClearance = null;
    if (enableClearance) {
      issuedClearance = engine.issueClearance(clearanceTtlMs);
      res.setHeader(clearanceHeader, issuedClearance);
      appendExposeHeader(res, clearanceHeader);

      const maxAgeSec = Math.floor(clearanceTtlMs / 1000);
      const cookieStr = `${clearanceCookie}=${issuedClearance}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`;
      appendSetCookie(res, cookieStr);
    }

    // Attach verification telemetry to request
    req.barstile = {
      verified: true,
      difficulty: result.difficulty,
      hash: result.hash,
      nonce: result.nonce,
      clearance: issuedClearance
    };

    if (typeof next === 'function') {
      return next();
    }
  };
}
