/**
 * Ultra-fast pure JavaScript SHA-256 implementation using 32-bit integer operations.
 * Runs synchronously without Promise overhead, making it ideal for client-side PoW solving
 * in browsers, Web Workers, Node.js, and edge runtimes.
 */

// Initial hash values (first 32 bits of fractional parts of square roots of first 8 primes 2..19)
const H_INIT = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]);

// 64 round constants (first 32 bits of fractional parts of cube roots of first 64 primes 2..311)
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

/**
 * Computes SHA-256 hash of a string, returning lowercase hex string.
 * @param {string} str
 * @returns {string}
 */
export function sha256Sync(str) {
  // Convert UTF-8 string to bytes
  const strLen = str.length;
  // Calculate padded length: message length + 1 (0x80) + padding zeros + 8 (length in bits)
  const bitLen = strLen * 8;
  const paddedLen = ((strLen + 9 + 63) >> 6) << 6;
  const bytes = new Uint8Array(paddedLen);

  for (let i = 0; i < strLen; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  bytes[strLen] = 0x80;

  // Append length in bits as 64-bit big-endian integer
  // High 32 bits (for strings < 500MB, high bits are 0)
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
      const s0 =
        ((W[t - 15] >>> 7) | (W[t - 15] << 25)) ^
        ((W[t - 15] >>> 18) | (W[t - 15] << 14)) ^
        (W[t - 15] >>> 3);

      const s1 =
        ((W[t - 2] >>> 17) | (W[t - 2] << 15)) ^
        ((W[t - 2] >>> 19) | (W[t - 2] << 13)) ^
        (W[t - 2] >>> 10);

      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 =
        ((e >>> 6) | (e << 26)) ^
        ((e >>> 11) | (e << 21)) ^
        ((e >>> 25) | (e << 7));

      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;

      const S0 =
        ((a >>> 2) | (a << 30)) ^
        ((a >>> 13) | (a << 19)) ^
        ((a >>> 22) | (a << 10));

      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return (
    h0.toString(16).padStart(8, '0') +
    h1.toString(16).padStart(8, '0') +
    h2.toString(16).padStart(8, '0') +
    h3.toString(16).padStart(8, '0') +
    h4.toString(16).padStart(8, '0') +
    h5.toString(16).padStart(8, '0') +
    h6.toString(16).padStart(8, '0') +
    h7.toString(16).padStart(8, '0')
  );
}
