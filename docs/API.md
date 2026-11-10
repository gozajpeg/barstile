# Barstile API Reference

Reference documentation for methods, options, and types exported by `barstile/server` and `barstile/client`.

---

## Server Module (`barstile/server`)

Import path:
```javascript
import {
  barstileMiddleware,
  createBarstile,
  Barstile,
  verifySolution,
  parseSolution,
  createChallengeToken,
  parseChallengeToken,
  verifyChallengeToken,
  ReplayCache
} from 'barstile/server';
```

---

### `barstileMiddleware(options)`

Creates an HTTP middleware compatible with Node.js `http.createServer`, Express, Connect, and Fastify.

#### Parameters

`options` (Object, optional):

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `difficulty` | `number` | `4` | Number of leading hexadecimal zeros required (range: 1 to 8). |
| `ttlMs` | `number` | `60000` | Challenge validity window in milliseconds (default: 60 seconds). |
| `secret` | `string` | Auto-generated | HMAC secret key. If omitted, a random 256-bit key is generated at startup. |
| `adaptiveRisk` | `boolean` | `false` | Enables multi-factor risk assessment. Adjusts PoW difficulty based on client risk. |
| `allowSilentPass` | `boolean` | `false` | Grants instant clearance to verified low-risk human clients without requiring PoW calculations. |
| `blockBots` | `boolean` | `false` | Immediately rejects automated browsers (Puppeteer, Selenium, Playwright) with HTTP 403. |
| `telemetryHeader` | `string` | `'x-barstile-telemetry'` | Request header inspected for browser probe telemetry. |
| `replayCache` | `ReplayCache` | `new ReplayCache()` | Custom replay cache instance. |
| `replayStore` | `any` | `undefined` | Pluggable replay store or cache instance. |
| `redis` | `any` | `undefined` | Redis client instance (e.g. ioredis, @redis/client) for multi-server replay defense. |
| `redisOptions` | `Object` | `{}` | Configuration options for Redis store (`prefix`, `fallbackToMemory`). |
| `barstile` | `Barstile` | `new Barstile(...)` | Pre-configured `Barstile` engine instance. |
| `shouldChallenge` | `(req) => boolean` | `() => true` | Predicate function. Return `false` to bypass PoW verification for specific requests (e.g. static assets). |
| `clearance` | `boolean` | `true` | Issue persistent clearance tokens to verified clients so subsequent requests pass without re-solving PoW. |
| `clearanceTtlMs` | `number` | `900000` | Duration of persistent clearance in milliseconds (default: 15 minutes). |
| `clearanceQuota` | `number` | `100` | Maximum requests allowed per clearance token (0 for unlimited). |
| `quotaHeader` | `string` | `'x-barstile-remaining'` | Response header exposing remaining request allowance. |
| `clearanceHeader` | `string` | `'x-barstile-clearance'` | Header name inspected and issued for clearance. |
| `clearanceCookie` | `string` | `'barstile_clearance'` | Cookie name written and inspected for clearance. |
| `headerName` | `string` | `'x-barstile-solution'` | Header name inspected for the client solution. |
| `challengeHeader` | `string` | `'X-Barstile-Challenge'` | Header name written on `449 Retry With` responses. |
| `routes` | `Record<string, number \| Object>` | `undefined` | Route-specific rules and method overrides for adaptive difficulty and clearance settings. |
| `tarpit` | `boolean \| Object \| TarpitTracker` | `undefined` | Memory-bounded IP sliding-window rate limiter and connection tarpitting engine for abusive clients. |
| `maxPreChallengeBodyBytes` | `number` | `65536` | Maximum payload size (bytes) permitted for unverified requests before solving PoW (default: 64KB). Set to `0` to disable. |

#### Route-Specific Adaptive Difficulty (`options.routes`)

You can define custom difficulty, bypass clearance, or adjust quotas per endpoint:

```javascript
app.use(barstileMiddleware({
  difficulty: 3, // Global default
  routes: {
    // 1. Method and path match
    'POST /api/login': 5,
    'POST /api/register': 5,

    // 2. Wildcard prefix match
    '/public/*': 1,
    '/api/internal/*': 4,

    // 3. Object syntax with clearance and quota control
    'POST /checkout': {
      difficulty: 4,
      clearance: false // Require fresh PoW solve on every transaction
    },
    'GET /search': {
      difficulty: 2,
      clearanceQuota: 25 // Allow up to 25 queries per clearance solve
    }
  }
}));
```

#### Adaptive Tarpit & IP Rate Limiting (`options.tarpit`)

To throttle unverified request floods and penalize repeated invalid solutions, enable the tarpit engine:

```javascript
app.use(barstileMiddleware({
  tarpit: {
    maxRequests: 60,                   // 60 requests allowed per sliding window
    windowMs: 60000,                   // 60-second sliding window
    consecutiveFailureThreshold: 5,    // 5 failed verifications put client in penalty state
    tarpitDelayMs: 3000,               // Penalty quarantine duration in ms
    delayMs: 2000,                     // Non-blocking response delay in ms for violators
    dropSocket: true                   // Reset TCP socket immediately for abusive floods
  }
}));
```

| Sub-Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxRequests` | `number` | `60` | Maximum unverified requests permitted per sliding window. |
| `windowMs` | `number` | `60000` | Sliding rate limit window in milliseconds. |
| `consecutiveFailureThreshold` | `number` | `5` | Number of failed verification attempts before penalty triggers. |
| `tarpitDelayMs` | `number` | `3000` | Penalty quarantine duration in milliseconds. |
| `delayMs` | `number` | `0` | Artificial non-blocking delay in milliseconds before returning error. |
| `dropSocket` | `boolean` | `false` | Immediately terminates TCP socket on limit violation. |
| `maxTrackedIps` | `number` | `10000` | Hard cap on tracked IP buckets. Enforces LRU eviction to bound memory under 5MB. |

#### Recommended Middleware Placement (Memory and DoS Protection)

To prevent bots from forcing Node.js to buffer large request payloads into RAM before PoW verification, mount `barstileMiddleware()` **before** body parsing middleware:

```javascript
// Recommended: Barstile intercepts unverified requests in microseconds before body allocation
app.use(barstileMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

If an unverified client attempts to send an oversized payload exceeding `maxPreChallengeBodyBytes` (default: 64KB), Barstile closes the connection immediately, aborts the stream, and returns HTTP 449 with a challenge without allocating heap memory for the body.

#### Built-in Dedicated Endpoints

When `barstileMiddleware()` is mounted, it automatically handles two dedicated verification routes:

1. **`GET /api/barstile/challenge`**:
   Issues a fresh challenge token for frontend widgets or asynchronous solvers.
   * Status: `200 OK`
   * Response: `{ challenge: string, header: string }`

2. **`POST /api/barstile/verify`**:
   Receives the client PoW solution and telemetry probe envelope.
   * If automated tools (Puppeteer, Playwright, Selenium) are detected and `blockBots: true`, returns HTTP 403 `automation_detected`.
   * If telemetry is omitted when `blockBots: true`, returns HTTP 403 `telemetry_required`.
   * If challenge salt does not match probe salt, returns HTTP 403 `telemetry_replay_detected`.
   * If mathematical solution is valid, returns HTTP 200 `{ verified: true, clearance: string, remaining: number }` and sets the `Set-Cookie` clearance header.

#### Behavior

* If the incoming request contains a valid clearance token (and quota remains):
  * Attaches clearance telemetry to `req.barstile`:
    ```javascript
    req.barstile = {
      verified: true,
      clearance: true,
      expiresAt: 1774008120000,
      remaining: 99
    };
    ```
  * Calls `next()` to yield to the route handler.
* If the incoming request contains a valid solution:
  * Attaches verification metadata to `req.barstile`:
    ```javascript
    req.barstile = {
      verified: true,
      difficulty: 4,
      hash: "0000a1b2...",
      nonce: 48120,
      clearance: "salt.issuedAt.expiresAt.signature",
      remaining: 100
    };
    ```
  * Sets `X-Barstile-Clearance` and `Set-Cookie` (if clearance is enabled).
  * Calls `next()` to yield to the route handler.
* If the solution or clearance is missing:
  * Returns HTTP status `449 (Retry With)`.
  * Sets response header `X-Barstile-Challenge: <token>`.
  * Appends exposed headers to `Access-Control-Expose-Headers` for CORS support.
  * Sends JSON payload:
    ```json
    {
      "error": "pow_required",
      "message": "Proof of work required to pass barstile",
      "challenge": "<token>",
      "header": "x-barstile-challenge"
    }
    ```
* If the clearance quota is exhausted:
  * Returns HTTP status `449 (Retry With)`.
  * Sets response header `X-Barstile-Challenge: <freshToken>`.
  * Sends JSON payload:
    ```json
    {
      "error": "clearance_exhausted",
      "message": "Clearance request allowance exhausted. New proof of work required.",
      "challenge": "<freshToken>",
      "header": "x-barstile-challenge"
    }
    ```
* If the submitted solution is expired, replayed, or mathematically invalid:
  * Returns HTTP status `403 (Forbidden)`.
  * Sets response header `Connection: close`.
  * Sets response header `X-Barstile-Challenge: <freshToken>` so legitimate retry is possible.
  * Sends JSON payload:
    ```json
    {
      "error": "barstile_failed",
      "reason": "<reason>",
      "challenge": "<freshToken>"
    }
    ```

---

### `createBarstile(options)` / `new Barstile(options)`

Factory function and class for programmatic challenge generation and verification without HTTP middleware.

#### Parameters

`options` (Object, optional):

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `difficulty` | `number` | `4` | Number of leading hex zeros required (1 to 8). |
| `ttlMs` | `number` | `60000` | Validity window in milliseconds. |
| `secret` | `string` | Auto-generated | HMAC secret key. |
| `maxCached` | `number` | `50000` | Maximum capacity of the default replay cache. |
| `replayCache` | `Object` | Default cache | Custom cache providing `has(key)` and `add(key, expiresAt)`. |

#### Methods

##### `barstile.issueChallenge(customDifficulty?)`
Generates a signed challenge token string.
* Returns: `string` (format: `salt.difficulty.expiresAt.signature`)

##### `barstile.verify(solution)`
Verifies a submitted solution string (`challenge:nonce`) or object (`{ token, nonce }`).
* Returns: `{ valid: boolean, reason?: string, hash?: string, difficulty?: number, nonce?: number }`

##### `barstile.issueClearance(ttlMs?)`
Generates an HMAC-signed clearance token.
* `ttlMs` (`number`, default: `900000`): Duration in milliseconds (default: 15 minutes).
* Returns: `string` (format: `salt.issuedAt.expiresAt.signature`)

##### `barstile.verifyClearance(token, now?)`
Verifies an HMAC-signed clearance token.
* Returns: `{ valid: boolean, reason?: string, expiresAt?: number, issuedAt?: number }`

---

### `verifySolution(params)`

Standalone solution verification function.

#### Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `params.solution` | `string \| Object` | Solution submitted by client (`"token:nonce"` or `{ token, nonce }`). |
| `params.secret` | `string` | Server HMAC secret used to sign the token. |
| `params.replayCache` | `ReplayCache` (optional) | Cache used to detect and reject replay attempts. |
| `params.now` | `number` (optional) | Timestamp in ms for testing expiration (default: `Date.now()`). |

#### Return Value

```javascript
{
  valid: true,
  hash: "0000...",
  difficulty: 4,
  nonce: 12345
}
```
Or on failure:
```javascript
{
  valid: false,
  reason: "invalid_signature" // or "challenge_expired", "replay_detected", "invalid_work", "malformed_solution", "malformed_challenge"
}
```

---

### `ReplayCache(options)`

In-memory cache designed to track spent nonces until their challenge expires.

#### Parameters

`options` (Object, optional):

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxSize` | `number` | `50000` | Maximum tracked entries before oldest entries are evicted. |
| `pruneIntervalMs` | `number` | `30000` | Background cleanup interval in ms. Set to `0` to disable interval. |

#### Methods

* `cache.add(key, expiresAt)`: Stores key with its expiration timestamp.
* `cache.has(key)`: Returns `true` if key is present and not expired. Evicts key lazily if expired.
* `cache.prune()`: Manually purges all expired keys.
* `cache.destroy()`: Clears memory and stops background timers.
* `cache.size`: Getter returning active entry count.

---

### `RedisReplayStore(client, options?)`

Universal Redis adapter for cluster-wide replay defense across multi-pod deployments. Compatible with `ioredis`, `@redis/client`, and any client with standard `.set()` and `.get()` methods.

#### Parameters

* `client` (`any`): An active Redis client instance.
* `options.prefix` (`string`, default: `'barstile:replay:'`): Key prefix for stored replay nonces.
* `options.fallbackToMemory` (`boolean`, default: `true`): Automatically fall back to local in-memory replay prevention if Redis encounters a network error or outage.

#### Example

```javascript
import Redis from 'ioredis';
import { barstileMiddleware } from 'barstile/server';

const redis = new Redis(process.env.REDIS_URL);
const guard = barstileMiddleware({ redis });
```

---

### `AllowanceCache(options)`

Memory-bounded request budget tracker used by Barstile to cap the number of requests permitted on a single clearance token.

#### Parameters

`options` (Object, optional):

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxSize` | `number` | `50000` | Maximum tracked clearance sessions before oldest is evicted. |
| `pruneIntervalMs` | `number` | `30000` | Periodic cleanup sweep interval in ms. |

#### Methods

* `cache.consume(key, maxQuota, ttlSeconds, expiresAt)`: Atomically increments and evaluates request counter. Returns `{ allowed: boolean, remaining: number, count: number }`.
* `cache.prune()`: Purges expired session records from memory.
* `cache.destroy()`: Cleans up background interval timers.

---

### `TarpitTracker(options)`

Memory-bounded sliding-window rate limiter and quarantine penalty tracker. Caps memory usage by enforcing an LRU eviction policy across tracked client IP records.

#### Parameters

`options` (Object, optional):

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxTrackedIps` | `number` | `10000` | Maximum number of IP records retained in memory before oldest is evicted. |
| `windowMs` | `number` | `60000` | Sliding rate limit window duration in milliseconds. |
| `maxRequests` | `number` | `60` | Maximum unverified requests permitted per window. |
| `consecutiveFailureThreshold` | `number` | `5` | Failed verification attempts before triggering penalty quarantine. |
| `tarpitDelayMs` | `number` | `3000` | Duration of penalty quarantine state in milliseconds. |
| `pruneIntervalMs` | `number` | `30000` | Periodic cleanup interval in milliseconds for expired IP records. |

#### Methods

* `tracker.recordRequest(ip, now = Date.now())`: Evaluates and records an incoming request. Returns `{ allowed: boolean, count: number, remaining: number, penalized: boolean }`.
* `tracker.recordFailure(ip, now = Date.now())`: Increments consecutive failure counter for the IP. Quarantines IP if threshold is reached. Returns `{ penalized: boolean, failureCount: number }`.
* `tracker.recordSuccess(ip, now = Date.now())`: Clears consecutive failure counter and lifts penalty state.
* `tracker.isPenalized(ip, now = Date.now())`: Returns `true` if the IP is currently in penalty quarantine.
* `tracker.prune(now = Date.now())`: Sweeps and deletes inactive or expired IP records.
* `tracker.destroy()`: Cleans up background interval timers and clears the in-memory map.

---

### `calculateRiskScore(params)`

Computes multi-factor risk assessment combining HTTP headers, browser environment probe telemetry, and user interaction signals.

#### Parameters

`params` (Object, optional):

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `params.headers` | `Object` | `{}` | Incoming HTTP request headers. |
| `params.probe` | `Object` | `null` | Decoded browser probe telemetry object from `decodeProbeTelemetry()`. |
| `params.behavior` | `Object` | `null` | Passive behavioral metrics from `createBehaviorTracker()`. |

#### Return Value

```javascript
{
  score: 0.15,                            // Risk score from 0.0 (clean human) to 1.0 (bot)
  action: 'pass',                         // Recommended action: 'pass' | 'challenge' | 'block'
  recommendedDifficulty: 0,              // Target PoW difficulty if challenged (0 for pass)
  factors: ['organic_pointer_curvature']  // List of triggering security heuristics
}
```

---

## Client Module (`barstile/client`)

Import path:
```javascript
import {
  barstileFetch,
  renderWidget,
  autoInitializeWidgets,
  collectBrowserProbe,
  createBehaviorTracker,
  solve,
  solveSync,
  solveWorker,
  isWebWorkerSupported,
  sha256Sync,
  parseChallengeToken
} from 'barstile/client';
```

---

### `barstileFetch(input, init, options)`

Drop-in replacement for native `window.fetch` or Node.js `fetch`.

#### Parameters

* `input` (`string | URL | Request`): Request destination.
* `init` (`RequestInit`, optional): Standard fetch options (method, headers, body, signal).
* `options` (Object, optional):
  * `clearance` (`boolean`, default: `true`): Store and attach persistent clearance tokens.
  * `worker` (`boolean`, default: `true`): Offload PoW calculation to a background Web Worker thread in browsers. Automatically falls back to main-thread async solver if workers are unavailable or blocked by CSP.
  * `challengeStatuses` (`number[]`, default: `[449, 429]`): HTTP status codes triggering automatic challenge solving.
  * `challengeHeader` (`string`, default: `'x-barstile-challenge'`): Header name inspected for challenge tokens.
  * `solutionHeader` (`string`, default: `'X-Barstile-Solution'`): Header name attached to retry requests.
  * `clearanceHeader` (`string`, default: `'X-Barstile-Clearance'`): Header name inspected and stored for clearance tokens.
  * `solverOptions` (`Object`, optional): Options forwarded to `solve()` or `solveWorker()` (`maxAttempts`, `signal`, `onProgress`).
  * `fetchFn` (`typeof fetch`, default: `globalThis.fetch`): Custom fetch implementation.

#### Behavior

1. Sends the initial HTTP request (attaching cached clearance token if available).
2. If the response status is not in `challengeStatuses` (e.g. not `449` or `429`), returns the response immediately.
3. If the response status is a challenge status:
   * Clears any stale in-memory clearance token.
   * Reads challenge token from `X-Barstile-Challenge` header or response JSON body.
   * Runs `solveWorker()` (or `solve()` if worker is false or unsupported) to calculate the nonce.
   * Clones request headers and adds `X-Barstile-Solution: <challenge>:<nonce>`.
   * Re-executes the request and returns the retry response.
4. If the retry response contains `X-Barstile-Clearance`, caches the clearance token in memory and automatically attaches it to subsequent `barstileFetch` requests.

---

### `clearClearance()`

Clears the in-memory clearance token stored by `barstileFetch`.

---

### `getActiveClearance()`

Returns the current active in-memory clearance token if non-expired, or `null`.
* Returns: `string | null`

---

### `solve(challenge, options)`

Asynchronous Proof-of-Work solver. Yields periodically to the event loop so browser rendering and user input are not blocked during calculation.

#### Parameters

* `challenge` (`string`): The challenge token received from server.
* `options` (Object, optional):
  * `chunkSize` or `yieldInterval` (`number`, default: `25000`): Number of hash iterations before yielding execution back to the event loop.
  * `maxAttempts` (`number`, default: `20000000`): Maximum nonces to test before throwing an error.
  * `startNonce` (`number`, default: `0`): Starting nonce counter.
  * `signal` (`AbortSignal`, optional): Cancellation signal to stop calculation early.
  * `onProgress` (`function`, optional): Callback invoked after each batch: `({ attempts, durationMs }) => void`.

#### Return Value

```javascript
{
  solution: "salt.diff.exp.sig:48210",
  nonce: 48210,
  hash: "0000f48a...",
  attempts: 48211,
  durationMs: 34.2
}
```

---

### `solveWorker(challenge, options)`

Background thread Proof-of-Work solver using an inline Blob Web Worker. Keeps the main browser UI thread unblocked and responsive during calculation, preserving smooth animations and instant input responsiveness.

If Web Workers are unavailable (e.g. Node.js or SSR) or blocked by strict Content Security Policy directives, `solveWorker()` automatically and transparently falls back to `solve()` without throwing.

#### Parameters

* `challenge` (`string`): Challenge token string.
* `options` (Object, optional):
  * `maxAttempts` (`number`, default: `20000000`): Maximum nonces to test.
  * `startNonce` (`number`, default: `0`): Starting nonce value.
  * `signal` (`AbortSignal`, optional): Cancellation signal to terminate worker execution.
  * `onProgress` (`function`, optional): Progress callback: `({ attempts, durationMs }) => void`.

#### Return Value

Returns the same result object as `solve()`.

---

### `isWebWorkerSupported()`

Returns `true` if the runtime environment supports inline Web Workers (`window`, `Worker`, `Blob`, `URL.createObjectURL`), or `false` otherwise.

* Returns: `boolean`

---

### `solveSync(challenge, options)`

Synchronous Proof-of-Work solver. Runs directly on the current thread without Promise overhead. Suitable for Web Workers, Node.js background threads, or scripts.

#### Parameters

* `challenge` (`string`): Challenge token string.
* `options` (Object, optional):
  * `maxAttempts` (`number`, default: `20000000`): Iteration limit.
  * `startNonce` (`number`, default: `0`): Starting nonce.

#### Return Value

Returns the same result object as `solve()`.

---

### `sha256Sync(str)`

Pure JavaScript SHA-256 implementation using 32-bit typed arrays. Zero dependencies and zero imports.

#### Parameters

* `str` (`string`): UTF-8 string to hash.

#### Return Value

* `string`: 64-character lowercase hexadecimal hash.

---

### `renderWidget(target, options)`

Mounts a Turnstile-style verification box inside a container element or CSS selector. Automatically injects a hidden `<input name="barstile-token">` and binds to parent form submit events.

#### Parameters

* `target` (`HTMLElement | string`): Container DOM element or CSS selector string.
* `options` (Object, optional):
  * `mode` (`'interactive' | 'invisible'`, default: `'interactive'`): Display mode. Interactive renders a checkbox UI. Invisible solves in the background without UI.
  * `challengeUrl` (`string`, default: `'/api/barstile/challenge'`): Endpoint to fetch the challenge token.
  * `verifyUrl` (`string`, default: `'/api/barstile/verify'`): Endpoint to verify solution and telemetry.
  * `onSuccess` (`(token: string) => void`, optional): Callback invoked when verification completes.
  * `onError` (`(err: Error) => void`, optional): Callback invoked on network or verification error.

#### Return Value

Returns a widget controller instance:

```javascript
{
  getToken: () => string | null,                       // Current clearance token or null
  getStatus: () => 'idle' | 'solving' | 'verified' | 'error', // Current widget lifecycle state
  verify: () => Promise<string>,                      // Triggers or awaits verification
  destroy: () => void                                 // Removes form listeners and clears container
}
```

---

### `autoInitializeWidgets()`

Scans the active document for elements matching `.barstile-widget` or `[data-barstile]` and initializes them.

Reads the following data attributes:
* `data-mode`: `'interactive'` (default) or `'invisible'`.
* `data-challenge-url`: Challenge endpoint URL (default: `'/api/barstile/challenge'`).
* `data-verify-url`: Verification endpoint URL (default: `'/api/barstile/verify'`).

* Returns: `Array<WidgetController>`

---

### `collectBrowserProbe(win)`

Gathers client runtime integrity markers and automation indicators without collecting private user information.

#### Parameters

* `win` (`Window`, optional): Target window object (defaults to global window).

#### Return Value

```javascript
{
  isBrowser: true,
  automation: {
    isAutomated: false,
    markers: [] // e.g. ['webdriver_active']
  },
  anomalies: [], // e.g. ['zero_outer_dimensions']
  renderer: {
    renderer: "ANGLE (NVIDIA...)",
    vendor: "Google Inc.",
    isSoftwareRasterizer: false
  },
  tampered: [], // e.g. ['Function.prototype.toString']
  hardware: {
    concurrency: 8,
    deviceMemory: 8,
    platform: "Win32",
    languagesCount: 2
  }
}
```

---

### `createBehaviorTracker(win)`

Tracks passive pointer movement curvature and key intervals to differentiate natural human movement from automated linear scripts.

#### Parameters

* `win` (`Window`, optional): Target window object.

#### Return Value

```javascript
{
  getTelemetry: () => ({
    active: true,
    hasInteracted: true,
    moves: 42,
    curvedTransitions: 28,
    linearTransitions: 2,
    curvatureRatio: 0.93,
    keyCount: 5
  }),
  stop: () => void // Detaches event listeners
}
```

---

## Frameworks Module (`barstile/react`)

Import path:
```javascript
import { BarstileWidget } from 'barstile/react';
```

### `BarstileWidget(props)`

Drop-in verification widget component for React and Next.js applications. SSR-safe and built using native `React.createElement` with zero JSX build dependencies.

#### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `mode` | `'interactive' \| 'invisible'` | `'interactive'` | Widget interaction mode. |
| `challengeUrl` | `string` | `'/api/barstile/challenge'` | Dedicated challenge endpoint URL. |
| `verifyUrl` | `string` | `'/api/barstile/verify'` | Dedicated verification endpoint URL. |
| `onSuccess` | `(token: string) => void` | `undefined` | Callback invoked upon successful solve with issued token. |
| `onError` | `(error: Error) => void` | `undefined` | Callback invoked upon verification failure. |
| `className` | `string` | `undefined` | Optional CSS class name applied to wrapper container. |
| `style` | `Object` | `undefined` | Optional inline styles applied to wrapper container. |

---

## Web Component Module (`barstile/web-component`)

Import path:
```javascript
import 'barstile/web-component';
// Or import the class directly:
import { BarstileWidgetElement } from 'barstile/web-component';
```

### `<barstile-widget>` / `BarstileWidgetElement`

Standard HTML5 Custom Element compatible with any modern web framework (Vue, Svelte, Angular, Solid) or vanilla HTML forms.

#### Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data-mode` | `'interactive' \| 'invisible'` | `'interactive'` | Verification mode. |
| `data-challenge-url` | `string` | `'/api/barstile/challenge'` | Challenge endpoint URL. |
| `data-verify-url` | `string` | `'/api/barstile/verify'` | Verification endpoint URL. |

#### Custom Events

* `barstile-success`: Dispatched on successful verification. Access token via `event.detail.token`.
* `barstile-error`: Dispatched on verification failure. Access error via `event.detail.error`.

#### Methods

* `element.verify()`: Programmatically triggers the verification flow. Returns a Promise resolving to the token string.
* `element.getToken()`: Returns the active clearance token, or `null`.
* `element.getStatus()`: Returns current widget status (`'idle'`, `'verifying'`, `'success'`, `'error'`).
* `element.destroy()`: Disconnects listeners and cleans up internal references.
