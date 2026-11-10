export { Barstile, createBarstile } from './barstile.js';
export { barstileMiddleware } from './middleware.js';
export { verifySolution, parseSolution } from '../core/verifier.js';
export { createChallengeToken, parseChallengeToken, verifyChallengeToken } from '../core/challenge.js';
export { createClearanceToken, verifyClearanceToken } from '../core/clearance.js';
export { ReplayCache, AllowanceCache } from '../core/cache.js';
export { generateSecret, sha256, hmacSign, hmacVerify, randomSalt } from '../core/crypto.js';
export { extractClientIp, normalizeIpSubnet, getClientFingerprint } from '../core/fingerprint.js';
export { resolveRouteConfig, extractPathname } from '../core/route.js';
export { RedisReplayStore } from './redis.js';
export { TarpitTracker } from '../core/tarpit.js';
export {
  calculateRiskScore,
  evaluateHeaderHeuristics,
  evaluateProbeTelemetry,
  evaluateBehaviorTelemetry
} from '../core/risk.js';
export { decodeProbeTelemetry, encodeProbeTelemetry } from '../client/probe.js';
