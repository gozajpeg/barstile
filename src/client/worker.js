import { solve } from './solver.js';

const WORKER_SCRIPT = `
const H_INIT = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]);

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

const W = new Uint32Array(64);
const textEncoder = new TextEncoder();

function encodeUtf8(str) {
  const len = str.length;
  for (let i = 0; i < len; i++) {
    if (str.charCodeAt(i) > 127) {
      return textEncoder.encode(str);
    }
  }
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

function sha256Sync(str) {
  const rawBytes = encodeUtf8(str);
  const strLen = rawBytes.length;
  const bitLen = strLen * 8;
  const paddedLen = ((strLen + 9 + 63) >> 6) << 6;
  const bytes = new Uint8Array(paddedLen);

  bytes.set(rawBytes);
  bytes[strLen] = 0x80;

  const highBits = Math.floor(bitLen / 0x100000000);
  const lowBits = bitLen >>> 0;

  bytes[paddedLen - 8] = (highBits >>> 24) & 0xff;
  bytes[paddedLen - 7] = (highBits >>> 16) & 0xff;
  bytes[paddedLen - 6] = (highBits >>> 8) & 0xff;
  bytes[paddedLen - 5] = highBits & 0xff;
  bytes[paddedLen - 4] = (lowBits >>> 24) & 0xff;
  bytes[paddedLen - 3] = (lowBits >>> 16) & 0xff;
  bytes[paddedLen - 2] = (lowBits >>> 8) & 0xff;
  bytes[paddedLen - 1] = lowBits & 0xff;

  let h0 = H_INIT[0];
  let h1 = H_INIT[1];
  let h2 = H_INIT[2];
  let h3 = H_INIT[3];
  let h4 = H_INIT[4];
  let h5 = H_INIT[5];
  let h6 = H_INIT[6];
  let h7 = H_INIT[7];

  for (let chunkOffset = 0; chunkOffset < paddedLen; chunkOffset += 64) {
    for (let t = 0; t < 16; t++) {
      const idx = chunkOffset + (t << 2);
      W[t] =
        (bytes[idx] << 24) |
        (bytes[idx + 1] << 16) |
        (bytes[idx + 2] << 8) |
        bytes[idx + 3];
    }
    for (let t = 16; t < 64; t++) {
      const v0 = W[t - 15];
      const s0 = ((v0 >>> 7) | (v0 << 25)) ^ ((v0 >>> 18) | (v0 << 14)) ^ (v0 >>> 3);
      const v1 = W[t - 2];
      const s1 = ((v1 >>> 17) | (v1 << 15)) ^ ((v1 >>> 19) | (v1 << 13)) ^ (v1 >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + K[i] + W[i]) | 0;
      const s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const hexDigits = '0123456789abcdef';
  let out = '';
  const hashArr = [h0, h1, h2, h3, h4, h5, h6, h7];
  for (let i = 0; i < 8; i++) {
    const val = hashArr[i];
    for (let shift = 28; shift >= 0; shift -= 4) {
      out += hexDigits[(val >>> shift) & 0xf];
    }
  }
  return out;
}

self.onmessage = function(event) {
  const data = event.data;
  if (!data || data.type !== 'solve') return;

  const challenge = data.challenge;
  const maxAttempts = data.maxAttempts || 20000000;
  const startNonce = data.startNonce || 0;
  const reportProgress = Boolean(data.reportProgress);

  try {
    const parts = challenge.split('.');
    if (parts.length !== 4) {
      self.postMessage({ type: 'error', error: 'barstile: malformed challenge token' });
      return;
    }

    const salt = parts[0];
    const difficulty = parseInt(parts[1], 10);
    const expiresAt = parseInt(parts[2], 10);

    if (Date.now() > expiresAt) {
      self.postMessage({ type: 'error', error: 'barstile: challenge token has already expired' });
      return;
    }

    const targetPrefix = '0'.repeat(difficulty);
    const startTime = performance.now();
    let nonce = startNonce;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const hash = sha256Sync(salt + ':' + nonce);
      attempts += 1;

      if (hash.startsWith(targetPrefix)) {
        const durationMs = performance.now() - startTime;
        self.postMessage({
          type: 'success',
          solution: challenge + ':' + nonce,
          nonce: nonce,
          hash: hash,
          attempts: attempts,
          durationMs: durationMs
        });
        return;
      }

      if (reportProgress && attempts % 50000 === 0) {
        self.postMessage({
          type: 'progress',
          attempts: attempts,
          durationMs: performance.now() - startTime
        });
      }

      nonce += 1;
    }

    self.postMessage({
      type: 'error',
      error: 'barstile: failed to solve challenge within ' + maxAttempts + ' attempts'
    });
  } catch (err) {
    self.postMessage({ type: 'error', error: err.message || 'Unknown worker error' });
  }
};
`;

/**
 * Checks whether the current runtime environment supports inline Blob Web Workers.
 * Returns false in Node.js, SSR, or environments without browser Worker/Blob APIs.
 *
 * @returns {boolean}
 */
export function isWebWorkerSupported() {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof Worker === 'function' &&
      typeof Blob === 'function' &&
      typeof URL !== 'undefined' &&
      typeof URL.createObjectURL === 'function'
    );
  } catch {
    return false;
  }
}

/**
 * Solves a Barstile Proof-of-Work challenge in a background Web Worker thread.
 * If Web Workers are unavailable or restricted by Content Security Policy,
 * transparently falls back to the async main-thread solver without error.
 *
 * @param {string} challenge - Challenge token string
 * @param {Object} [options]
 * @param {number} [options.maxAttempts=20000000] - Hard cap on total hash iterations
 * @param {number} [options.startNonce=0] - Initial nonce value
 * @param {AbortSignal} [options.signal] - Optional AbortSignal to cancel solving
 * @param {(progress: { attempts: number, durationMs: number }) => void} [options.onProgress]
 * @returns {Promise<{ solution: string, nonce: number, hash: string, attempts: number, durationMs: number }>}
 */
export async function solveWorker(challenge, options = {}) {
  if (!isWebWorkerSupported()) {
    return solve(challenge, options);
  }

  let blobUrl = null;
  let worker = null;

  try {
    const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
    blobUrl = URL.createObjectURL(blob);
    worker = new Worker(blobUrl);
  } catch {
    // If CSP blocks blob: workers or Worker instantiation fails, fallback safely
    if (blobUrl) {
      try { URL.revokeObjectURL(blobUrl); } catch { /* ignore cleanup error */ }
    }
    return solve(challenge, options);
  }

  return new Promise((resolve, reject) => {
    let cleanedUp = false;

    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      if (worker) {
        try { worker.terminate(); } catch { /* ignore termination error */ }
      }
      if (blobUrl) {
        try { URL.revokeObjectURL(blobUrl); } catch { /* ignore revoke error */ }
      }
    };

    if (options.signal) {
      if (options.signal.aborted) {
        cleanup();
        return reject(new DOMException('Aborted', 'AbortError'));
      }
      options.signal.addEventListener(
        'abort',
        () => {
          cleanup();
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true }
      );
    }

    const handleMessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'progress') {
        if (typeof options.onProgress === 'function') {
          options.onProgress({
            attempts: data.attempts,
            durationMs: data.durationMs
          });
        }
        return;
      }

      if (data.type === 'success') {
        cleanup();
        resolve({
          solution: data.solution,
          nonce: data.nonce,
          hash: data.hash,
          attempts: data.attempts,
          durationMs: data.durationMs
        });
        return;
      }

      if (data.type === 'error') {
        cleanup();
        reject(new Error(data.error || 'barstile: background worker failed to solve challenge'));
      }
    };

    worker.onmessage = handleMessage;
    if (typeof worker.addEventListener === 'function') {
      worker.addEventListener('message', handleMessage);
    }

    const handleError = () => {
      cleanup();
      // On runtime worker error, fallback to main-thread solve
      solve(challenge, options).then(resolve, reject);
    };

    worker.onerror = handleError;
    if (typeof worker.addEventListener === 'function') {
      worker.addEventListener('error', handleError);
    }

    worker.postMessage({
      type: 'solve',
      challenge,
      maxAttempts: options.maxAttempts || 20_000_000,
      startNonce: options.startNonce || 0,
      reportProgress: typeof options.onProgress === 'function'
    });
  });
}
