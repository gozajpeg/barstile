# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-11-25

### Added
* First-class TypeScript declarations (`types/`) across all entry points (`barstile`, `server`, `client`, `react`, `web-component`).
* Web Standard Fetch API support via `handleRequest(engine, request, options)` for Next.js App Router (`middleware.ts`), Cloudflare Workers, Hono, and Bun.
* Next.js Server Action verification via `verifyAction(formData, options)` for one-line cryptographic validation and anti-replay defense.
* Multi-OS and multi-Node CI test matrix (`.github/workflows/test.yml`) covering Ubuntu, Windows, and macOS on Node 18, 20, and 22.
* Portable test runner (`scripts/test.js`) ensuring cross-platform test discovery without shell globbing dependencies.

### Fixed
* Added `createCustomEvent` safe fallback in `src/client/web-component.js` to prevent `ReferenceError: CustomEvent is not defined` in Node 18 and SSR environments.
* Fixed event constructor mock in `test/frameworks.test.js` to avoid attempting assignment to read-only `Event.prototype.type`.

---

## [1.1.0] - 2026-11-20

### Added
* Defaulted widget mode to `'invisible'` across the web widget, React component, and Web Component.
* Client/server clock skew compensation via `src/client/clock.js` and `getServerTime()`.
* Module-level token sharing (`sharedClearance`) across multiple protected forms on the same page.
* Thundering herd promise coalescing in `barstileFetch` for concurrent asynchronous requests.
* Automated PoW difficulty escalation (`HTTP 449`) on detected probe anomalies with mobile-safe cap.

### Changed
* Switched invisible widget initialization to lazy solve (idle on load, computes only on form interaction or submission).
* Documented `blockBots: boolean | 'escalate'` configuration in `docs/API.md`.

### Fixed
* Prevented form rejection after long inactivity via automated token freshness checks (`isTokenFresh`).
* Added immediate single-retry on transient network drop during challenge retrieval.
* Guarded clock offset calculation against stale proxy/CDN caches using the `Age` header.
* Filtered one-time route solutions (`clearance: false`) from being incorrectly cached or shared.

---

## [1.0.1] - 2026-10-26

### Added
* Support for passing a direct difficulty number to `barstile.issueChallenge(difficulty)`.
* Support for `solution.token` alias in `parseSolution({ token, nonce })`.
* Support for `headerName` alias in `barstileMiddleware({ headerName })`.
* Documented `barstile.consumeClearance(signature, maxQuota?, expiresAt?)` and cluster configuration options.

### Fixed
* Corrected Web Component `element.getStatus()` documented return states to `'idle' | 'solving' | 'verified' | 'error'`.
* Fixed Express documentation snippet to avoid prematurely accessing unconfigured `riskScore`.

---

## [1.0.0] - 2026-10-22

### Added
* Initial release of Barstile: self-hosted, non-interactive bot protection.
* Native `barstileMiddleware` for Node.js `http`, Express, Fastify, and Connect.
* Client-side `barstileFetch` with automatic 449 challenge solving in inline Web Workers.
* Turnstile-style HTML form widget (`renderWidget` and `autoInitializeWidgets`).
* React SSR component (`BarstileWidget`) and native HTML5 Web Component (`<barstile-widget>`).
* In-memory `ReplayCache` and distributed `RedisReplayStore`.
* Request allowance budgeting via `AllowanceCache` with persistent clearance tokens.
* Memory-bounded sliding-window rate limiting via `TarpitTracker`.
* Multi-factor client risk scoring and browser environment integrity probes.
