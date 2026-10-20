import { solve } from './solver.js';

/**
 * Transparent fetch interceptor that automatically solves Barstile PoW challenges
 * and retries the request seamlessly.
 *
 * @param {RequestInfo | URL} input - Fetch target URL or Request
 * @param {RequestInit} [init] - Fetch options (method, headers, body, etc.)
 * @param {Object} [options]
 * @param {number[]} [options.challengeStatuses=[449, 429]] - Status codes that trigger challenge solving
 * @param {string} [options.challengeHeader='x-barstile-challenge'] - Response header containing challenge
 * @param {string} [options.solutionHeader='x-barstile-solution'] - Request header to attach solution
 * @param {Object} [options.solverOptions] - Options passed to solve() (e.g. onProgress, signal)
 * @param {typeof fetch} [options.fetchFn] - Custom fetch implementation (defaults to globalThis.fetch)
 * @returns {Promise<Response>}
 */
export async function barstileFetch(input, init = {}, options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  if (typeof fetchFn !== 'function') {
    throw new TypeError('barstileFetch: fetch is not available in this environment');
  }

  const challengeStatuses = options.challengeStatuses || [449, 429];
  const challengeHeader = (options.challengeHeader || 'x-barstile-challenge').toLowerCase();
  const solutionHeader = options.solutionHeader || 'X-Barstile-Solution';

  // 1. Send initial request
  const initialResponse = await fetchFn(input, init);

  // If not a PoW challenge response, return immediately
  if (!challengeStatuses.includes(initialResponse.status)) {
    return initialResponse;
  }

  // Check for challenge in headers
  let challenge = initialResponse.headers.get(challengeHeader);

  // If header was not exposed, attempt to check JSON body if readable
  if (!challenge) {
    try {
      const cloned = initialResponse.clone();
      const body = await cloned.json();
      if (body?.challenge && typeof body.challenge === 'string') {
        challenge = body.challenge;
      }
    } catch {
      // Body not JSON or already consumed; return original response
      return initialResponse;
    }
  }

  if (!challenge) {
    return initialResponse;
  }

  // Guard against unbuffered ReadableStream bodies that cannot be re-read
  if (init?.body && typeof init.body.getReader === 'function' && init.body.locked) {
    throw new Error(
      'barstileFetch: request body is an unbuffered ReadableStream that has already been consumed and cannot be replayed after a challenge. Buffer the body before passing to fetch.'
    );
  }

  // 2. Solve the challenge in the background
  const solutionResult = await solve(challenge, options.solverOptions);

  // 3. Clone request init and append solution header
  const retryInit = { ...init };
  const headers = new Headers(init.headers || {});
  headers.set(solutionHeader, solutionResult.solution);
  retryInit.headers = headers;

  // 4. Transparently retry request with solved proof-of-work
  return fetchFn(input, retryInit);
}
