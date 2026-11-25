export interface ChallengeOptions {
  difficulty?: number;
  ttlMs?: number;
  context?: string;
}

export interface VerifyResult {
  valid: boolean;
  reason?: string;
  nonce?: string;
  hash?: string;
  clearance?: string;
}

export interface BarstileOptions {
  secret?: string;
  difficulty?: number;
  ttlMs?: number;
  maxCached?: number;
  clearanceQuota?: number;
  allowanceStore?: any;
  redis?: any;
  redisOptions?: Record<string, any>;
  replayStore?: any;
  replayCache?: any;
}

export class Barstile {
  constructor(options?: BarstileOptions);
  difficulty: number;
  ttlMs: number;
  clearanceQuota: number;
  replayCache: any;
  allowanceStore: any;
  issueChallenge(overrides?: ChallengeOptions | number): string;
  verify(submittedSolution: string | { solution: string; context?: string }): VerifyResult;
  issueClearance(options?: { ip?: string; fingerprint?: string; ttlMs?: number; quota?: number; customPayload?: any }): string;
  verifyClearance(token: string, options?: { ip?: string; fingerprint?: string; consume?: boolean }): { valid: boolean; reason?: string; payload?: any };
}

export function createBarstile(options?: BarstileOptions): Barstile;

export interface MiddlewareOptions extends BarstileOptions {
  barstile?: Barstile;
  engine?: Barstile;
  routes?: Record<string, any>;
  exemptPaths?: (string | RegExp)[];
  allowanceQuota?: number;
  mode?: 'challenge' | 'clearance';
  enableTarpit?: boolean;
  tarpitDelayMs?: number;
  maxTarpitDelayMs?: number;
  tarpitThreshold?: number;
  ipHeader?: string;
  trustProxy?: boolean;
  maxBodyBytes?: number;
  enableRiskScoring?: boolean;
  riskThreshold?: number;
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    domain?: string;
    path?: string;
  };
}

export type BarstileMiddleware = (req: any, res: any, next?: (err?: any) => void) => void | Promise<void>;

export function barstileMiddleware(options?: MiddlewareOptions): BarstileMiddleware;

export function verifySolution(
  solution: string | { solution: string; context?: string },
  secret: string,
  options?: {
    replayCache?: any;
    expectedContext?: string;
    verifyContext?: boolean;
  }
): VerifyResult;

export function parseSolution(solution: string): {
  salt: string;
  difficulty: number;
  expiresAt: number;
  context?: string;
  signature: string;
  nonce: string;
};

export function createChallengeToken(options: {
  secret: string;
  difficulty?: number;
  ttlMs?: number;
  context?: string;
  salt?: string;
}): string;

export function parseChallengeToken(token: string): {
  salt: string;
  difficulty: number;
  expiresAt: number;
  context?: string;
  signature: string;
};

export function verifyChallengeToken(
  token: string,
  secret: string,
  options?: { expectedContext?: string }
): { valid: boolean; reason?: string; token?: any };

export function createClearanceToken(options: {
  secret: string;
  ip?: string;
  fingerprint?: string;
  ttlMs?: number;
  quota?: number;
  customPayload?: any;
}): string;

export function verifyClearanceToken(
  token: string,
  secret: string,
  options?: {
    expectedIp?: string;
    expectedFingerprint?: string;
    allowanceStore?: any;
    consume?: boolean;
  }
): { valid: boolean; reason?: string; payload?: any };

export class ReplayCache {
  constructor(options?: { maxSize?: number });
  has(key: string): boolean;
  add(key: string, ttlMs: number): void;
  consume(key: string, quota?: number): boolean;
  clear(): void;
  size: number;
}

export class AllowanceCache {
  constructor(options?: { maxSize?: number });
  get(key: string): number | null;
  set(key: string, count: number, ttlMs: number): void;
  consume(key: string, maxQuota: number): boolean;
  clear(): void;
}

export class RedisReplayStore {
  constructor(redisClient: any, options?: { keyPrefix?: string });
  has(key: string): Promise<boolean>;
  add(key: string, ttlMs: number): Promise<void>;
  consume(key: string, quota: number): Promise<boolean>;
}

export class TarpitTracker {
  constructor(options?: {
    baseDelayMs?: number;
    maxDelayMs?: number;
    multiplier?: number;
    threshold?: number;
    decayWindowMs?: number;
  });
  recordFailure(identifier: string): number;
  recordSuccess(identifier: string): void;
  getDelay(identifier: string): number;
  isPenalized(identifier: string): boolean;
}

export function generateSecret(bytes?: number): string;
export function sha256(data: string | Uint8Array): string;
export function hmacSign(data: string, secret: string): string;
export function hmacVerify(data: string, signature: string, secret: string): boolean;
export function randomSalt(bytes?: number): string;

export function extractClientIp(req: any, options?: { ipHeader?: string; trustProxy?: boolean }): string;
export function normalizeIpSubnet(ip: string): string;
export function getClientFingerprint(req: any, options?: { ip?: string; salt?: string }): string;

export function resolveRouteConfig(pathname: string, routes?: Record<string, any>): any;
export function extractPathname(req: any): string;

export function calculateRiskScore(factors: Record<string, any>, weights?: Record<string, number>): { score: number; flagged: boolean; factors: any };
export function evaluateHeaderHeuristics(req: any): { score: number; reasons: string[] };
export function evaluateProbeTelemetry(telemetry: any): { score: number; reasons: string[] };
export function evaluateBehaviorTelemetry(behavior: any): { score: number; reasons: string[] };

export function decodeProbeTelemetry(encoded: string): any;
export function encodeProbeTelemetry(probe: any): string;
