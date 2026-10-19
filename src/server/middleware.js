import { Turnstile } from './turnstile.js';

/**
 * Creates plug-and-play middleware for Express, Connect, and native Node.js HTTP servers.
 *
 * @param {Object} [options]
 * @param {Turnstile} [options.turnstile] - Existing Turnstile engine instance
 * @param {string} [options.secret] - Secret key (auto-generated if omitted)
 * @param {number} [options.difficulty=4] - Proof-of-Work difficulty (leading hex zeros)
 * @param {number} [options.ttlMs=60000] - Expiration window in milliseconds
 * @param {string} [options.challengeHeader='x-barstile-challenge'] - Response header containing challenge
 * @param {string} [options.solutionHeader='x-barstile-solution'] - Request header containing client solution
 * @param {number} [options.statusCode=449] - HTTP status code when PoW challenge is issued
 * @param {(req: any) => boolean} [options.shouldChallenge] - Optional filter function to conditionally enforce challenge
 * @param {(req: any, res: any, reason: string) => void} [options.onFailure] - Custom handler for verification failures
 * @returns {(req: any, res: any, next: (err?: any) => void) => void}
 */
export function barstileMiddleware(options = {}) {
  const engine = options.turnstile instanceof Turnstile
    ? options.turnstile
    : new Turnstile({
        secret: options.secret,
        difficulty: options.difficulty,
        ttlMs: options.ttlMs
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
      res.setHeader('Access-Control-Expose-Headers', challengeHeader);
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json');

      const payload = JSON.stringify({
        error: 'pow_required',
        message: 'Proof of work required to pass turnstile',
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
      res.setHeader('Access-Control-Expose-Headers', challengeHeader);

      if (typeof options.onFailure === 'function') {
        return options.onFailure(req, res, result.reason || 'invalid_solution');
      }

      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          error: 'turnstile_failed',
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
