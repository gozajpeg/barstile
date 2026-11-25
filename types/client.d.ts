export interface SolveOptions {
  onProgress?: (progress: { attempts: number; durationMs: number }) => void;
  yieldInterval?: number;
  maxAttempts?: number;
}

export interface SolveResult {
  solution: string;
  nonce: string;
  hash: string;
  attempts: number;
  durationMs: number;
}

export function solve(challengeToken: string, options?: SolveOptions): Promise<SolveResult>;
export function solveSync(challengeToken: string, options?: { maxAttempts?: number }): SolveResult;
export function solveWorker(challengeToken: string, options?: SolveOptions): Promise<SolveResult>;
export function isWebWorkerSupported(): boolean;

export function barstileFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: {
    challengeHeader?: string;
    solutionHeader?: string;
    onChallenge?: (challenge: string) => void;
    onSolved?: (result: SolveResult) => void;
  }
): Promise<Response>;

export function clearClearance(): void;
export function getActiveClearance(): string | null;
export function clearSharedClearance(): void;
export function parseChallengeToken(token: string): {
  salt: string;
  difficulty: number;
  expiresAt: number;
  context?: string;
  signature: string;
};
export function sha256Sync(data: string | Uint8Array): string;

export function collectBrowserProbe(): Promise<Record<string, any>>;
export function detectAutomation(): boolean;
export function detectEnvironmentAnomalies(): Record<string, any>;
export function detectHardwareRenderer(): { vendor?: string; renderer?: string };
export function detectPrototypeTampering(): boolean;
export function encodeProbeTelemetry(probe: any): string;
export function decodeProbeTelemetry(encoded: string): any;

export interface BehaviorTracker {
  start(): void;
  stop(): void;
  getTelemetry(): any;
  reset(): void;
}

export function createBehaviorTracker(options?: { sampleIntervalMs?: number; maxEvents?: number }): BehaviorTracker;

export interface WidgetInstance {
  destroy(): void;
  reset(): void;
  solve(): Promise<string>;
}

export interface WidgetOptions {
  mode?: 'invisible' | 'interactive';
  challengeUrl?: string;
  verifyUrl?: string;
  onSuccess?: (clearanceToken: string) => void;
  onError?: (error: Error) => void;
  theme?: 'auto' | 'light' | 'dark';
}

export function renderWidget(container: HTMLElement | string, options?: WidgetOptions): WidgetInstance;
export function autoInitializeWidgets(selector?: string, options?: WidgetOptions): WidgetInstance[];

export class BarstileWidgetElement extends HTMLElement {
  connectedCallback(): void;
  disconnectedCallback(): void;
  reset(): void;
  solve(): Promise<string>;
}

export function syncServerTime(serverTimestamp: number): void;
export function getServerTime(): number;
export function getClockOffset(): number;
export function resetClockOffset(): void;
