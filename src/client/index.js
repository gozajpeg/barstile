export { solve, solveSync } from './solver.js';
export { solveWorker, isWebWorkerSupported } from './worker.js';
export { barstileFetch, clearClearance, getActiveClearance } from './fetch.js';
export { parseChallengeToken } from '../core/token.js';
export { sha256Sync } from '../core/sha256.js';
export {
  collectBrowserProbe,
  detectAutomation,
  detectEnvironmentAnomalies,
  detectHardwareRenderer,
  detectPrototypeTampering,
  encodeProbeTelemetry,
  decodeProbeTelemetry
} from './probe.js';
export { createBehaviorTracker } from './behavior.js';
export { renderWidget, autoInitializeWidgets } from './widget.js';
export { BarstileWidgetElement } from './web-component.js';
