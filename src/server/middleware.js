import { Barstile } from './barstile.js';
import { getClientFingerprint, extractClientIp } from '../core/fingerprint.js';
import { resolveRouteConfig, extractPathname } from '../core/route.js';
import { calculateRiskScore } from '../core/risk.js';
import { decodeProbeTelemetry } from '../client/probe.js';
import { TarpitTracker } from '../core/tarpit.js';

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
 * Appends a header to Access-Control-Allow-Headers without overwriting existing allowed headers.
 * @param {any} res
 * @param {string} headerName
 */
function appendAllowHeader(res, headerName) {
  if (typeof res.getHeader !== 'function' || typeof res.setHeader !== 'function') return;
  const existing = res.getHeader('Access-Control-Allow-Headers');
  if (!existing) {
    res.setHeader('Access-Control-Allow-Headers', headerName);
  } else {
    const list = Array.isArray(existing) ? existing.join(', ') : String(existing);
    if (!list.toLowerCase().includes(headerName.toLowerCase())) {
      res.setHeader('Access-Control-Allow-Headers', `${list}, ${headerName}`);
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
 * Safely drains or aborts an incoming request stream when responding early before body parsing.
 * Prevents TCP socket hangs, ECONNRESET on HTTP keep-alive, and memory buffering.
 *
 * @param {any} req
 * @param {number} [maxBytes=65536]
 */
function discardStream(req, maxBytes = 65536) {
  if (!req || typeof req.on !== 'function') return;
  if (req.complete || req.destroyed) return;

  let bytesRead = 0;
  const onData = (chunk) => {
    bytesRead += chunk ? chunk.length : 0;
    if (maxBytes >= 0 && bytesRead > maxBytes) {
      cleanup();
      if (typeof req.destroy === 'function') {
        req.destroy();
      } else if (req.socket && typeof req.socket.destroy === 'function') {
        req.socket.destroy();
      }
    }
  };

  const cleanup = () => {
    if (typeof req.removeListener === 'function') {
      req.removeListener('data', onData);
      req.removeListener('end', cleanup);
      req.removeListener('error', cleanup);
      req.removeListener('close', cleanup);
    }
  };

  try {
    req.on('data', onData);
    req.once('end', cleanup);
    req.once('error', cleanup);
    req.once('close', cleanup);
    if (typeof req.resume === 'function') {
      req.resume();
    }
  } catch {
    // Suppress stream hook errors
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
 * @param {number} [options.ttlMs=60000] - Challenge expiration window in milliseconds
 * @param {boolean} [options.clearance=true] - Issue persistent clearance tokens to verified clients
 * @param {number} [options.clearanceTtlMs=900000] - Clearance duration in ms (default: 15 minutes)
 * @param {number} [options.maxPreChallengeBodyBytes=65536] - Maximum allowed payload size before challenge solve (default: 64KB)
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
  if (!options.secret && process.env.NODE_ENV === 'production') {
    console.warn('[barstile] Warning: No secret provided in options. Multi-instance setups will reject cross-server tokens.');
  }

  const customEngine = options.barstile || options.engine;
  const engine = customEngine instanceof Barstile
    ? customEngine
    : new Barstile({
        secret: options.secret,
        difficulty: options.difficulty,
        ttlMs: options.ttlMs,
        clearanceQuota: options.clearanceQuota,
        allowanceStore: options.allowanceStore,
        replayCache: options.replayCache,
        replayStore: options.replayStore,
        redis: options.redis,
        redisOptions: options.redisOptions
      });

  const challengeHeader = (options.challengeHeader || 'x-barstile-challenge').toLowerCase();
  const solutionHeader = (options.solutionHeader || 'x-barstile-solution').toLowerCase();
  const clearanceHeader = (options.clearanceHeader || 'x-barstile-clearance').toLowerCase();
  const clearanceCookie = options.clearanceCookie || 'barstile_clearance';
  const enableClearance = options.clearance !== false;
  const clearanceTtlMs = options.clearanceTtlMs || 900_000;
  const clearanceQuota = options.clearanceQuota !== undefined ? Math.floor(options.clearanceQuota) : 100;
  const maxPreChallengeBodyBytes = options.maxPreChallengeBodyBytes !== undefined
    ? Number(options.maxPreChallengeBodyBytes)
    : 65536;
  const quotaHeader = (options.quotaHeader || 'x-barstile-remaining').toLowerCase();
  const statusCode = options.statusCode || 449;

  const tarpitOpt = options.tarpit;
  const enableTarpit = Boolean(tarpitOpt);
  const tarpitTracker = enableTarpit
    ? (tarpitOpt instanceof TarpitTracker
        ? tarpitOpt
        : new TarpitTracker(typeof tarpitOpt === 'object' && tarpitOpt !== null ? tarpitOpt : {}))
    : null;
  const tarpitDropSocket = typeof tarpitOpt === 'object' && tarpitOpt !== null ? Boolean(tarpitOpt.dropSocket) : false;
  const tarpitDelayMs = typeof tarpitOpt === 'object' && tarpitOpt !== null && Number.isFinite(tarpitOpt.delayMs)
    ? Math.max(0, Math.floor(tarpitOpt.delayMs))
    : (tarpitTracker ? tarpitTracker.tarpitDelayMs : 3000);

  return async function middleware(req, res, next) {
    if (res.headersSent) {
      return next ? next() : undefined;
    }

    try {
      if (req?.method?.toUpperCase() === 'OPTIONS') {
        appendAllowHeader(res, solutionHeader);
        appendAllowHeader(res, clearanceHeader);
        appendAllowHeader(res, challengeHeader);
        if (typeof next === 'function') {
          return next();
        }
        res.statusCode = 204;
        return res.end();
      }

      const clientIp = extractClientIp(req, { trustProxy: Boolean(options.trustProxy) });

      // Adaptive tarpit & IP flood rate limit check
      if (enableTarpit && tarpitTracker) {
        const reqCheck = tarpitTracker.recordRequest(clientIp);
        if (!reqCheck.allowed || reqCheck.penalized) {
          if (tarpitDropSocket) {
            if (req.socket && typeof req.socket.destroy === 'function') {
              req.socket.destroy();
            } else if (typeof req.destroy === 'function') {
              req.destroy();
            }
            return;
          }

          if (tarpitDelayMs > 0) {
            await new Promise((resolve) => {
              let timer = setTimeout(resolve, tarpitDelayMs);
              const onReqClose = () => {
                if (timer) {
                  clearTimeout(timer);
                  timer = null;
                }
                resolve();
              };
              if (typeof req.once === 'function') {
                req.once('close', onReqClose);
              }
            });
          }

          if (res.destroyed || res.writableEnded) return;

          discardStream(req, 0);
          res.statusCode = 429;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Connection', 'close');
          return res.end(
            JSON.stringify({
              error: 'tarpit_limit_exceeded',
              message: 'Too many requests. Please slow down.',
              penalized: Boolean(reqCheck.penalized)
            })
          );
        }
      }

      // Compute cryptographic client fingerprint to bind clearance tokens and challenges
      const clientFingerprint = getClientFingerprint(req, {
        bindIp: options.bindIp !== false,
        bindSubnet: options.bindSubnet !== false,
        bindUserAgent: options.bindUserAgent !== false,
        trustProxy: Boolean(options.trustProxy)
      });

      // Resolve route-specific adaptive difficulty and clearance settings
      const routeConfig = resolveRouteConfig(req, {
        difficulty: options.difficulty,
        clearance: options.clearance,
        clearanceQuota: options.clearanceQuota,
        routes: options.routes
      });

      const effectiveDifficulty = routeConfig.difficulty;
      const effectiveClearance = enableClearance && routeConfig.clearance;
      const effectiveQuota = routeConfig.clearanceQuota;

      const pathname = extractPathname(req);
      const telemetryHeader = (options.telemetryHeader || 'x-barstile-telemetry').toLowerCase();

      const rawTelemetry =
        req.headers?.[telemetryHeader] ||
        req.query?.barstile_telemetry ||
        (typeof req.body === 'object' && req.body !== null
          ? req.body.telemetry || req.body.barstile_telemetry
          : null);

      const probe = rawTelemetry ? decodeProbeTelemetry(rawTelemetry) : null;
      const behavior = typeof req.body === 'object' && req.body !== null ? req.body.behavior : null;

      const solution =
        req.headers?.[solutionHeader] ||
        req.query?.barstile_solution ||
        (typeof req.body === 'object' && req.body !== null
          ? req.body.solution || req.body.barstile_solution || req.body.barstile_token || req.body['barstile-token']
          : null);

      const enableAdaptiveRisk = options.adaptiveRisk === true || routeConfig.adaptiveRisk === true;

      // Dedicated Challenge Endpoint (GET /api/barstile/challenge)
      if (req.method?.toUpperCase() === 'GET' && pathname === '/api/barstile/challenge') {
        discardStream(req, 0);
        const challenge = engine.issueChallenge({ difficulty: effectiveDifficulty, context: clientFingerprint });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(challengeHeader, challenge);
        appendExposeHeader(res, challengeHeader);
        return res.end(JSON.stringify({ challenge, header: challengeHeader }));
      }

      // Dedicated Verify Endpoint (POST /api/barstile/verify)
      if (req.method?.toUpperCase() === 'POST' && pathname === '/api/barstile/verify') {
        // Flaw 1 Fix: Guard against automation scrapers & telemetry omission
        const shouldBlockBots = options.blockBots === true || (enableAdaptiveRisk && options.blockBots !== false);
        if (shouldBlockBots) {
          if (!probe) {
            discardStream(req, 0);
            res.setHeader('Connection', 'close');
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            return res.end(
              JSON.stringify({
                error: 'barstile_failed',
                reason: 'telemetry_required'
              })
            );
          }

          if (probe.isAutomated || (probe.tampered && probe.tampered.length > 0)) {
            discardStream(req, 0);
            res.setHeader('Connection', 'close');
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            return res.end(
              JSON.stringify({
                error: 'barstile_failed',
                reason: 'automation_detected',
                markers: probe.markers?.length ? probe.markers : probe.tampered
              })
            );
          }
        }

        // Flaw 2 Fix: Validate solution existence
        if (!solution) {
          discardStream(req, 0);
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'solution_required', message: 'Missing solution token' }));
        }

        // Flaw 6 Fix: Validate challenge salt on telemetry envelope against replay attack
        const solutionTokenStr = typeof solution === 'string'
          ? solution
          : (solution?.solution || solution?.challenge || '');
        const [chalToken] = solutionTokenStr.split(':');
        const [expectedSalt] = chalToken ? chalToken.split('.') : [''];

        if (probe && expectedSalt && probe.salt && !expectedSalt.startsWith(probe.salt)) {
          discardStream(req, 0);
          res.setHeader('Connection', 'close');
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(
            JSON.stringify({
              error: 'barstile_failed',
              reason: 'telemetry_replay_detected'
            })
          );
        }

        const verifyRes = await engine.verify(solution, {
          now: Date.now(),
          context: clientFingerprint,
          minDifficulty: effectiveDifficulty
        });

        if (!verifyRes.valid) {
          if (enableTarpit && tarpitTracker) {
            tarpitTracker.recordFailure(clientIp);
          }
          discardStream(req, 0);
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'verification_failed', reason: verifyRes.reason }));
        }

        if (enableTarpit && tarpitTracker) {
          tarpitTracker.recordSuccess(clientIp);
        }

        // Flaw 4 Fix: Set-Cookie, Expose-Headers, clearance token, and remaining quota
        discardStream(req, maxPreChallengeBodyBytes);
        const clearance = engine.issueClearance(clearanceTtlMs, clientFingerprint);
        res.setHeader(clearanceHeader, clearance);
        appendExposeHeader(res, clearanceHeader);

        if (effectiveQuota > 0) {
          res.setHeader(quotaHeader, String(effectiveQuota));
          appendExposeHeader(res, quotaHeader);
        }

        const maxAgeSec = Math.floor(clearanceTtlMs / 1000);
        const cookieStr = `${clearanceCookie}=${clearance}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`;
        appendSetCookie(res, cookieStr);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(
          JSON.stringify({
            verified: true,
            clearance,
            remaining: effectiveQuota > 0 ? effectiveQuota : Infinity
          })
        );
      }

      if (typeof options.shouldChallenge === 'function' && !options.shouldChallenge(req)) {
        return next ? next() : undefined;
      }

      if (effectiveClearance) {
        const clearanceToken =
          req.headers?.[clearanceHeader] ||
          extractCookie(req, clearanceCookie) ||
          (typeof req.body === 'object' && req.body !== null
            ? req.body[clearanceHeader] || req.body.barstile_token || req.body['barstile-token']
            : null);

        if (clearanceToken) {
          const clearanceRes = engine.verifyClearance(clearanceToken, {
            now: Date.now(),
            context: clientFingerprint
          });
          if (clearanceRes.valid) {
            if (effectiveQuota > 0) {
              const allowanceRes = await engine.consumeClearance(
                clearanceRes.signature,
                effectiveQuota,
                clearanceRes.expiresAt
              );

              if (!allowanceRes.allowed) {
                discardStream(req, maxPreChallengeBodyBytes);
                const challenge = engine.issueChallenge({ difficulty: effectiveDifficulty, context: clientFingerprint });
                res.setHeader(challengeHeader, challenge);
                appendExposeHeader(res, challengeHeader);
                res.statusCode = statusCode;
                res.setHeader('Content-Type', 'application/json');

                return res.end(
                  JSON.stringify({
                    error: 'clearance_exhausted',
                    message: 'Clearance request allowance exhausted. New proof of work required.',
                    challenge,
                    header: challengeHeader
                  })
                );
              }

              res.setHeader(quotaHeader, String(allowanceRes.remaining));
              appendExposeHeader(res, quotaHeader);

              if (enableTarpit && tarpitTracker) {
        tarpitTracker.recordSuccess(clientIp);
      }

      req.barstile = {
                verified: true,
                clearance: true,
                expiresAt: clearanceRes.expiresAt,
                remaining: allowanceRes.remaining
              };
              return next ? next() : undefined;
            }

            if (enableTarpit && tarpitTracker) {
        tarpitTracker.recordSuccess(clientIp);
      }

      req.barstile = {
              verified: true,
              clearance: true,
              expiresAt: clearanceRes.expiresAt,
              remaining: Infinity
            };
            return next ? next() : undefined;
          }
        }
      }

      // Multi-factor risk calculation
      const risk = calculateRiskScore({
        headers: req.headers,
        probe,
        behavior
      });

      // Adaptive difficulty calculation based on risk score (opt-in via adaptiveRisk: true)
      const resolvedDifficulty = enableAdaptiveRisk
        ? Math.max(effectiveDifficulty, risk.recommendedDifficulty)
        : effectiveDifficulty;

      // Silent Pass for trusted human users
      const allowSilentPass = options.allowSilentPass === true || routeConfig.silentPass === true;
      if (allowSilentPass && !solution && risk.action === 'pass') {
        let silentClearance = null;
        if (effectiveClearance) {
          silentClearance = engine.issueClearance(clearanceTtlMs, clientFingerprint);
          res.setHeader(clearanceHeader, silentClearance);
          appendExposeHeader(res, clearanceHeader);

          if (effectiveQuota > 0) {
            res.setHeader(quotaHeader, String(effectiveQuota));
            appendExposeHeader(res, quotaHeader);
          }

          const maxAgeSec = Math.floor(clearanceTtlMs / 1000);
          const cookieStr = `${clearanceCookie}=${silentClearance}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`;
          appendSetCookie(res, cookieStr);
        }

        if (enableTarpit && tarpitTracker) {
        tarpitTracker.recordSuccess(clientIp);
      }

      req.barstile = {
          verified: true,
          silentPass: true,
          riskScore: risk.score,
          riskFactors: risk.factors,
          clearance: silentClearance,
          remaining: effectiveQuota > 0 ? effectiveQuota : Infinity
        };
        return next ? next() : undefined;
      }

      // Hard block for detected automation frameworks (Puppeteer, Playwright, Selenium)
      const shouldBlockBots = options.blockBots === true || (enableAdaptiveRisk && options.blockBots !== false);
      if (shouldBlockBots && (probe?.isAutomated || (probe?.tampered && probe.tampered.length > 0))) {
        discardStream(req, 0);
        res.setHeader('Connection', 'close');
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        return res.end(
          JSON.stringify({
            error: 'barstile_failed',
            reason: 'automation_detected',
            markers: probe.markers?.length ? probe.markers : probe.tampered
          })
        );
      }

      if (!solution) {
        const rawContentLength = req.headers?.['content-length'];
        const contentLength = rawContentLength ? Number.parseInt(rawContentLength, 10) : 0;
        const isOversized = maxPreChallengeBodyBytes > 0 && Number.isFinite(contentLength) && contentLength > maxPreChallengeBodyBytes;

        if (isOversized) {
          res.setHeader('Connection', 'close');
          discardStream(req, 0);
        } else {
          discardStream(req, maxPreChallengeBodyBytes);
        }

        const challenge = engine.issueChallenge({ difficulty: resolvedDifficulty, context: clientFingerprint });
        res.setHeader(challengeHeader, challenge);
        appendExposeHeader(res, challengeHeader);
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json');

        const payload = JSON.stringify({
          error: 'pow_required',
          message: isOversized
            ? 'Proof of work required before submitting request payload'
            : 'Proof of work required to pass barstile',
          challenge,
          header: challengeHeader
        });

        return res.end(payload);
      }

      const result = await engine.verify(solution, {
        now: Date.now(),
        context: clientFingerprint,
        minDifficulty: effectiveDifficulty
      });

      if (!result.valid) {
        if (enableTarpit && tarpitTracker) {
          tarpitTracker.recordFailure(clientIp);
        }
        discardStream(req, 0);
        res.setHeader('Connection', 'close');

        const freshChallenge = engine.issueChallenge({ difficulty: resolvedDifficulty, context: clientFingerprint });
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

      let issuedClearance = null;
      if (effectiveClearance) {
        issuedClearance = engine.issueClearance(clearanceTtlMs, clientFingerprint);
        res.setHeader(clearanceHeader, issuedClearance);
        appendExposeHeader(res, clearanceHeader);

        if (effectiveQuota > 0) {
          res.setHeader(quotaHeader, String(effectiveQuota));
          appendExposeHeader(res, quotaHeader);
        }

        const maxAgeSec = Math.floor(clearanceTtlMs / 1000);
        const cookieStr = `${clearanceCookie}=${issuedClearance}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`;
        appendSetCookie(res, cookieStr);
      }

      if (enableTarpit && tarpitTracker) {
        tarpitTracker.recordSuccess(clientIp);
      }

      req.barstile = {
        verified: true,
        difficulty: result.difficulty,
        hash: result.hash,
        nonce: result.nonce,
        clearance: issuedClearance,
        remaining: effectiveQuota > 0 ? effectiveQuota : Infinity,
        riskScore: risk.score,
        riskFactors: risk.factors,
        telemetry: probe
      };

      if (typeof next === 'function') {
        return next();
      }
    } catch (err) {
      if (typeof next === 'function') {
        return next(err);
      }
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'internal_error', message: err.message }));
    }
  };
}
