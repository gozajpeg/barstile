import { Barstile } from './barstile.js';
import { extractClientIp, getClientFingerprint } from '../core/fingerprint.js';

/**
 * Parses cookies from a standard Cookie header string.
 * @param {string} cookieHeader
 * @returns {Record<string, string>}
 */
function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  const cookies = {};
  const pairs = cookieHeader.split(';');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].trim();
    if (!pair) continue;
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    cookies[key] = decodeURIComponent(val);
  }
  return cookies;
}

/**
 * Handles Web Standard Request/Response bot protection for Next.js (middleware.ts),
 * Cloudflare Workers, Hono, Bun, and standard fetch servers.
 *
 * @param {Barstile} engine
 * @param {Request} request
 * @param {object} [options]
 * @param {number} [options.difficulty]
 * @param {string} [options.challengePath='/api/barstile/challenge']
 * @param {string} [options.verifyPath='/api/barstile/verify']
 * @param {string} [options.challengeHeader='X-Barstile-Challenge']
 * @param {string} [options.clearanceHeader='X-Barstile-Clearance']
 * @param {string} [options.clearanceCookie='barstile_clearance']
 * @param {number} [options.clearanceTtlMs=900000]
 * @param {boolean} [options.trustProxy=false]
 * @param {(req: Request) => boolean} [options.shouldChallenge]
 * @returns {Promise<Response | null>} Returns Response to intercept/challenge; returns null to let request proceed.
 */
export async function handleRequest(engine, request, options = {}) {
  if (!engine) throw new TypeError('Barstile engine instance is required');
  if (!request || typeof request.url !== 'string') {
    throw new TypeError('Standard Web Request object is required');
  }

  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = (request.method || 'GET').toUpperCase();

  const challengePath = options.challengePath || '/api/barstile/challenge';
  const verifyPath = options.verifyPath || '/api/barstile/verify';
  const challengeHeader = options.challengeHeader || 'X-Barstile-Challenge';
  const clearanceHeader = options.clearanceHeader || 'X-Barstile-Clearance';
  const clearanceCookie = options.clearanceCookie || 'barstile_clearance';
  const difficulty = options.difficulty !== undefined ? options.difficulty : engine.difficulty;
  const clearanceTtlMs = options.clearanceTtlMs || 900000;

  // Extract client IP and fingerprint from Web Standard Request headers
  const pseudoReq = {
    headers: Object.fromEntries(request.headers.entries()),
    socket: {}
  };
  const clientIp = extractClientIp(pseudoReq, { trustProxy: Boolean(options.trustProxy) });
  const fingerprint = getClientFingerprint(pseudoReq, {
    bindIp: options.bindIp !== false,
    bindSubnet: options.bindSubnet !== false,
    bindUserAgent: options.bindUserAgent !== false,
    trustProxy: Boolean(options.trustProxy)
  });

  // 1. Dedicated Challenge Endpoint: GET /api/barstile/challenge
  if (method === 'GET' && pathname === challengePath) {
    const challenge = engine.issueChallenge({ difficulty, context: fingerprint });
    return new Response(JSON.stringify({ challenge, header: challengeHeader }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-store, no-cache, max-age=0',
        [challengeHeader]: challenge,
        'Access-Control-Expose-Headers': challengeHeader
      }
    });
  }

  // 2. Dedicated Verify Endpoint: POST /api/barstile/verify
  if (method === 'POST' && pathname === verifyPath) {
    let solution = request.headers.get('x-barstile-solution') ||
                   request.headers.get('x-barstile-token');

    if (!solution) {
      try {
        const cloned = request.clone();
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const body = await cloned.json();
          solution = body.solution || body.token || body['barstile-token'];
        } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
          const formData = await cloned.formData();
          solution = formData.get('solution') || formData.get('token') || formData.get('barstile-token');
        }
      } catch {
        // Fallback if body parsing fails
      }
    }

    if (!solution) {
      return new Response(JSON.stringify({ error: 'solution_required', message: 'Missing solution token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const verifyResult = await engine.verify(solution, { context: fingerprint });
    if (!verifyResult.valid) {
      return new Response(JSON.stringify({ error: 'invalid_solution', reason: verifyResult.reason }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const clearance = engine.issueClearance(clearanceTtlMs, fingerprint);
    const isSecure = url.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
    const maxAgeSec = Math.floor(clearanceTtlMs / 1000);
    const cookieStr = `${clearanceCookie}=${clearance}; Path=/; HttpOnly; SameSite=Lax${isSecure ? '; Secure' : ''}; Max-Age=${maxAgeSec}`;

    return new Response(JSON.stringify({ verified: true, clearance }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        [clearanceHeader]: clearance,
        'Set-Cookie': cookieStr,
        'Access-Control-Expose-Headers': clearanceHeader
      }
    });
  }

  // 3. Conditional filter: check if this route should be challenged
  if (typeof options.shouldChallenge === 'function' && !options.shouldChallenge(request)) {
    return null;
  }

  // 4. General Route Protection: check clearance token in header or cookie
  const cookies = parseCookies(request.headers.get('cookie') || '');
  const clearanceToken = request.headers.get(clearanceHeader.toLowerCase()) ||
                         request.headers.get('x-barstile-token') ||
                         cookies[clearanceCookie];

  if (clearanceToken) {
    let clearanceRes = engine.verifyClearance(clearanceToken, { context: fingerprint });
    if (!clearanceRes.valid) {
      clearanceRes = engine.verifyClearance(clearanceToken, { context: '' });
    }
    if (clearanceRes.valid) {
      return null; // Valid clearance, allow request to proceed!
    }
  }

  // 5. No valid clearance: return HTTP 449 Challenge
  const challenge = engine.issueChallenge({ difficulty, context: fingerprint });
  return new Response(JSON.stringify({
    error: 'challenge_required',
    message: 'Bot challenge verification required',
    challenge,
    header: challengeHeader
  }), {
    status: 449,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store, no-cache, max-age=0',
      [challengeHeader]: challenge,
      'Access-Control-Expose-Headers': challengeHeader
    }
  });
}

/**
 * Verifies a submission from a Next.js Server Action or FormData payload.
 *
 * @param {FormData | Record<string, any> | string} formData
 * @param {object} options
 * @param {Barstile} options.engine
 * @param {string} [options.tokenField='barstile-token']
 * @param {string} [options.context]
 * @returns {Promise<{ valid: boolean, error?: string, token?: string, type?: 'clearance' | 'solution' }>}
 */
export async function verifyAction(formData, options = {}) {
  const engine = options.engine;
  if (!engine) throw new TypeError('Barstile engine instance is required in options');

  let token = null;
  const tokenField = options.tokenField || 'barstile-token';

  if (typeof formData === 'string') {
    token = formData;
  } else if (formData && typeof formData.get === 'function') {
    token = formData.get(tokenField) || formData.get('barstile_token') || formData.get('token');
  } else if (formData && typeof formData === 'object') {
    token = formData[tokenField] || formData.barstile_token || formData.token;
  }

  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'missing_token' };
  }

  // Check if it is a proof-of-work solution (contains nonce delimiter ':')
  if (token.includes(':')) {
    const solutionRes = await engine.verify(token, { context: options.context });
    if (solutionRes.valid) {
      return { valid: true, type: 'solution', token };
    }
    return { valid: false, error: solutionRes.reason || 'invalid_solution' };
  }

  // Otherwise treat as clearance token
  let clearanceRes = engine.verifyClearance(token, { context: options.context });
  if (!clearanceRes.valid && options.context) {
    clearanceRes = engine.verifyClearance(token, { context: '' });
  }
  if (clearanceRes.valid) {
    if (options.singleUse && engine.replayCache) {
      const replayKey = `clearance:${token}`;
      const isFresh = await engine.replayCache.checkAndAdd(replayKey, clearanceRes.expiresAt);
      if (!isFresh) {
        return { valid: false, error: 'replay_detected' };
      }
    }
    return { valid: true, type: 'clearance', token };
  }

  return { valid: false, error: clearanceRes.reason || 'invalid_clearance' };
}
