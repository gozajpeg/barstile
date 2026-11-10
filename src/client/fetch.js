import { solve } from './solver.js';
import { solveWorker } from './worker.js';
import { collectBrowserProbe, encodeProbeTelemetry } from './probe.js';

let storedClearance = null;
let storedClearanceExpiresAt = 0;

/**
 * Manually clears any cached clearance token in the client interceptor.
 */
export function clearClearance() {
  storedClearance = null;
  storedClearanceExpiresAt = 0;
}

/**
 * Returns the currently active clearance token, if non-expired.
 * @returns {string | null}
 */
export function getActiveClearance() {
  if (storedClearance && Date.now() < storedClearanceExpiresAt) {
    return storedClearance;
  }
  return null;
}

/**
 * Saves a clearance token into the client cache.
 * @param {string} token
 */
function recordClearance(token) {
  if (!token || typeof token !== 'string') return;
  const parts = token.split('.');
  if (parts.length === 4 || parts.length === 3) {
    const expIdx = parts.length === 4 ? 2 : 1;
    const exp = Number.parseInt(parts[expIdx], 10);
    if (!Number.isNaN(exp)) {
      storedClearance = token;
      storedClearanceExpiresAt = exp;
    }
  }
}

/**
 * Transparent fetch interceptor that automatically solves Barstile PoW challenges,
 * preserves clearance tokens across requests, and retries seamlessly.
 *
 * @param {RequestInfo | URL} input - Fetch target URL or Request
 * @param {RequestInit} [init] - Fetch options (method, headers, body, etc.)
 * @param {Object} [options]
 * @param {boolean} [options.clearance=true] - Automatically attach and store clearance tokens
 * @param {boolean} [options.worker=true] - Offload PoW solving to a Web Worker background thread
 * @param {number[]} [options.challengeStatuses=[449, 429]] - Status codes that trigger challenge solving
 * @param {string} [options.challengeHeader='x-barstile-challenge'] - Response header containing challenge
 * @param {string} [options.solutionHeader='x-barstile-solution'] - Request header to attach solution
 * @param {string} [options.clearanceHeader='x-barstile-clearance'] - Request/Response header for clearance
 * @param {Object} [options.solverOptions] - Options passed to solve() (e.g. onProgress, signal)
 * @param {typeof fetch} [options.fetchFn] - Custom fetch implementation (defaults to globalThis.fetch)
 * @returns {Promise<Response>}
 */
export async function barstileFetch(input, init = {}, options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  if (typeof fetchFn !== 'function') {
    throw new TypeError('barstileFetch: fetch is not available in this environment');
  }

  const isRequest =
    typeof input === 'object' && input !== null && typeof input.clone === 'function';
  const firstInput = isRequest && !input.bodyUsed ? input.clone() : input;

  const challengeStatuses = options.challengeStatuses || [449, 429];
  const challengeHeader = (options.challengeHeader || 'x-barstile-challenge').toLowerCase();
  const solutionHeader = options.solutionHeader || 'X-Barstile-Solution';
  const clearanceHeader = options.clearanceHeader || 'X-Barstile-Clearance';
  const useClearance = options.clearance !== false;

  const initialInit = { ...init };
  const existingHeaders =
    init.headers || (typeof input === 'object' && input?.headers ? input.headers : {});
  const headers = new Headers(existingHeaders);

  if (useClearance) {
    const activeToken = getActiveClearance();
    if (activeToken && !headers.has(clearanceHeader)) {
      headers.set(clearanceHeader, activeToken);
    }
  }
  initialInit.headers = headers;

  const initialResponse = await fetchFn(firstInput, initialInit);

  if (useClearance) {
    const resClearance = initialResponse.headers.get(clearanceHeader.toLowerCase());
    if (resClearance) {
      recordClearance(resClearance);
    }
  }

  if (!challengeStatuses.includes(initialResponse.status)) {
    return initialResponse;
  }

  if (useClearance) {
    clearClearance();
  }

  let challenge = initialResponse.headers.get(challengeHeader);
  if (!challenge) {
    try {
      const cloned = initialResponse.clone();
      const body = await cloned.json();
      if (body?.challenge && typeof body.challenge === 'string') {
        challenge = body.challenge;
      }
    } catch {
      return initialResponse;
    }
  }

  if (!challenge) {
    return initialResponse;
  }

  if (init?.body && typeof init.body.getReader === 'function' && (init.body.locked || init.body.disturbed)) {
    throw new Error(
      'barstileFetch: request body is an unbuffered ReadableStream that has already been consumed and cannot be replayed after a challenge. Buffer the body before passing to fetch.'
    );
  }

  const useWorker = options.worker !== false;
  const solverOpts = options.solverOptions || {};
  const solutionResult = useWorker
    ? await solveWorker(challenge, solverOpts)
    : await solve(challenge, solverOpts);

  const retryInit = { ...init };
  const retryHeaders = new Headers(existingHeaders);
  retryHeaders.set(solutionHeader, solutionResult.solution);

  if (options.telemetry !== false) {
    try {
      const [salt] = challenge.split('.');
      const probe = collectBrowserProbe(typeof window !== 'undefined' ? window : null);
      const telemetryEnvelope = encodeProbeTelemetry(probe, salt);
      retryHeaders.set(options.telemetryHeader || 'X-Barstile-Telemetry', telemetryEnvelope);
    } catch {
      // Telemetry collection should not block legitimate retry
    }
  }

  retryInit.headers = retryHeaders;

  const retryResponse = await fetchFn(input, retryInit);

  if (useClearance) {
    const freshClearance = retryResponse.headers.get(clearanceHeader.toLowerCase());
    if (freshClearance) {
      recordClearance(freshClearance);
    }
  }

  return retryResponse;
}
