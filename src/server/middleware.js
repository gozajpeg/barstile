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
 * Creates plug-and-play middleware for Express, Connect, and native Node.js HTTP servers.
 *
 * @param {Object} [options]
 * @param {Barstile} [options.barstile] - Existing Barstile engine instance
 * @param {Barstile} [options.engine] - Alias for options.barstile
 * @param {string} [options.secret] - Secret key (auto-generated if omitted)
 * @param {number} [options.difficulty=4] - Proof-of-Work difficulty (leading hex zeros)
 * @param {number} [options.ttlMs=60000] - Expiration window in milliseconds
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
  const statusCode = options.statusCode || 449;

  return function middleware(req, res, next) {
    if (typeof options.shouldChallenge === 'function' && !options.shouldChallenge(req)) {
      return next ? next() : undefined;
    }

    // Check for solution in header, query, or body
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

    // Verify submitted solution
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

    // Attach verification telemetry to request
    req.barstile = {
      verified: true,
      difficulty: result.difficulty,
      hash: result.hash,
      nonce: result.nonce
    };

    if (typeof next === 'function') {
      return next();
    }
  };
}
