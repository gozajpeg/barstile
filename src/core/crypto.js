import crypto from 'node:crypto';

/**
 * Computes SHA-256 hash of a string, returning a lowercase hex string.
 * @param {string} data
 * @returns {string}
 */
export function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Computes HMAC-SHA256 signature for data using the given secret key.
 * @param {string} data
 * @param {string} secret
 * @returns {string}
 */
export function hmacSign(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verifies HMAC-SHA256 in constant time to prevent timing side-channel attacks.
 * @param {string} data
 * @param {string} secret
 * @param {string} expectedSignature
 * @returns {boolean}
 */
export function hmacVerify(data, secret, expectedSignature) {
  if (typeof expectedSignature !== 'string') return false;
  if (!secret) return false;

  const actualSignature = hmacSign(data, secret);

  const actualBuf = Buffer.from(actualSignature, 'hex');
  const expectedBuf = Buffer.from(expectedSignature, 'hex');

  if (actualBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

/**
 * Generates a cryptographically secure random hex salt.
 * @param {number} [byteLength=16]
 * @returns {string}
 */
export function randomSalt(byteLength = 16) {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Generates an automatic 256-bit server secret key on startup (Zero-Config).
 * @param {number} [byteLength=32]
 * @returns {string}
 */
export function generateSecret(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString('hex');
}
