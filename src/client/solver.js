import { parseChallengeToken } from '../core/challenge.js';
import { sha256Sync } from '../core/sha256-pure.js';

/**
 * Solves a Barstile Proof-of-Work challenge synchronously.
 * Ideal for Web Workers, Node.js, and background threads.
 *
 * @param {string} challenge - Challenge token string
 * @param {Object} [options]
 * @param {number} [options.maxAttempts=20000000] - Hard cap on hash iterations
 * @param {number} [options.startNonce=0] - Initial nonce value
 * @returns {{ solution: string, nonce: number, hash: string, attempts: number, durationMs: number }}
 */
export function solveSync(challenge, options = {}) {
  const parsed = parseChallengeToken(challenge);
  if (!parsed) {
    throw new Error('barstile: invalid or malformed challenge token');
  }

  const { salt, difficulty, expiresAt } = parsed;
  if (Date.now() > expiresAt) {
    throw new Error('barstile: challenge token has already expired');
  }

  const targetPrefix = '0'.repeat(difficulty);
  const maxAttempts = options.maxAttempts || 20_000_000;
  const startNonce = options.startNonce || 0;
  const startTime = performance.now();

  let nonce = startNonce;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const hash = sha256Sync(`${salt}:${nonce}`);
    attempts += 1;

    if (hash.startsWith(targetPrefix)) {
      const durationMs = performance.now() - startTime;
      return {
        solution: `${challenge}:${nonce}`,
        nonce,
        hash,
        attempts,
        durationMs
      };
    }

    nonce += 1;
  }

  throw new Error(`barstile: failed to solve challenge within ${maxAttempts} attempts`);
}

/**
 * Solves a Barstile Proof-of-Work challenge asynchronously without blocking the browser main thread.
 * Yields control back to the event loop every `chunkSize` iterations.
 *
 * @param {string} challenge - Challenge token string
 * @param {Object} [options]
 * @param {number} [options.chunkSize=25000] - Iterations per yield to maintain 60 FPS UI
 * @param {number} [options.maxAttempts=20000000] - Hard cap on total hash iterations
 * @param {AbortSignal} [options.signal] - Optional AbortSignal to cancel solving
 * @param {(progress: { attempts: number, durationMs: number }) => void} [options.onProgress]
 * @returns {Promise<{ solution: string, nonce: number, hash: string, attempts: number, durationMs: number }>}
 */
export async function solve(challenge, options = {}) {
  const parsed = parseChallengeToken(challenge);
  if (!parsed) {
    throw new Error('barstile: invalid or malformed challenge token');
  }

  const { salt, difficulty, expiresAt } = parsed;
  if (Date.now() > expiresAt) {
    throw new Error('barstile: challenge token has already expired');
  }

  const targetPrefix = '0'.repeat(difficulty);
  const chunkSize = options.chunkSize || 25_000;
  const maxAttempts = options.maxAttempts || 20_000_000;
  const signal = options.signal;
  const startTime = performance.now();

  let nonce = options.startNonce || 0;
  let attempts = 0;

  return new Promise((resolve, reject) => {
    function processChunk() {
      if (signal?.aborted) {
        return reject(new DOMException('Aborted', 'AbortError'));
      }

      if (Date.now() > expiresAt) {
        return reject(new Error('barstile: challenge token expired during solving'));
      }

      const chunkLimit = Math.min(attempts + chunkSize, maxAttempts);

      while (attempts < chunkLimit) {
        const hash = sha256Sync(`${salt}:${nonce}`);
        attempts += 1;

        if (hash.startsWith(targetPrefix)) {
          const durationMs = performance.now() - startTime;
          return resolve({
            solution: `${challenge}:${nonce}`,
            nonce,
            hash,
            attempts,
            durationMs
          });
        }

        nonce += 1;
      }

      if (options.onProgress) {
        options.onProgress({
          attempts,
          durationMs: performance.now() - startTime
        });
      }

      if (attempts >= maxAttempts) {
        return reject(
          new Error(`barstile: failed to solve challenge within ${maxAttempts} attempts`)
        );
      }

      // Yield control back to browser / event loop
      setTimeout(processChunk, 0);
    }

    processChunk();
  });
}
