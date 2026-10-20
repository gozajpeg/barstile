/**
 * Pure, environment-agnostic token parser with zero dependencies.
 * Safe to import in browsers, Web Workers, Node.js, and edge runtimes.
 */

/**
 * Parses and validates the structural components of a challenge token.
 * Format: "salt.difficulty.expiresAt.signature"
 *
 * @param {string} token
 * @returns {{ salt: string, difficulty: number, expiresAt: number, signature: string } | null}
 */
export function parseChallengeToken(token) {
  if (typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 4) return null;

  const [salt, diffStr, expStr, signature] = parts;
  const difficulty = Number.parseInt(diffStr, 10);
  const expiresAt = Number.parseInt(expStr, 10);

  if (
    !salt ||
    !signature ||
    Number.isNaN(difficulty) ||
    difficulty < 1 ||
    difficulty > 8 ||
    Number.isNaN(expiresAt) ||
    expiresAt <= 0
  ) {
    return null;
  }

  return { salt, difficulty, expiresAt, signature };
}
