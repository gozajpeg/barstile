# Barstile API Reference

Complete reference for all methods, options, and types exported by `barstile/server` and `barstile/client`.

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
| `replayCache` | `ReplayCache` | `new ReplayCache()` | Custom replay cache instance. |
| `barstile` | `Barstile` | `new Barstile(...)` | Pre-configured `Barstile` engine instance. |
| `shouldChallenge` | `(req) => boolean` | `() => true` | Predicate function. Return `false` to bypass PoW verification for specific requests (e.g. static assets). |
| `clearance` | `boolean` | `true` | Issue persistent clearance tokens to verified clients so subsequent requests pass without re-solving PoW. |
| `clearanceTtlMs` | `number` | `900000` | Duration of persistent clearance in milliseconds (default: 15 minutes). |
| `clearanceHeader` | `string` | `'x-barstile-clearance'` | Header name inspected and issued for clearance. |
| `clearanceCookie` | `string` | `'barstile_clearance'` | Cookie name written and inspected for clearance. |
| `headerName` | `string` | `'x-barstile-solution'` | Header name inspected for the client solution. |
| `challengeHeader` | `string` | `'X-Barstile-Challenge'` | Header name written on `449 Retry With` responses. |

#### Behavior

* If the incoming request contains a valid solution:
  * Verification metadata is attached to `req.barstile`:
    ```javascript
    req.barstile = {
      valid: true,
      difficulty: 4,
      hash: "0000a1b2...",
      nonce: 48120
    };
    ```
  * Calls `next()` to yield to the route handler.
* If the solution is missing:
  * Returns HTTP status `449 (Retry With)`.
  * Sets response header `X-Barstile-Challenge: <token>`.
  * Sets response header `Retry-After: 5`.
  * Appends exposed headers to `Access-Control-Expose-Headers` for CORS support.
  * Sends JSON payload: `{ error: 'challenge_required', challenge: '<token>', difficulty: 4 }`.
* If the solution is expired, replayed, or mathematically invalid:
  * Returns HTTP status `403 (Forbidden)`.
  * Sends JSON payload: `{ error: 'verification_failed', reason: '<reason>' }`.

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
* Returns: `string` (format: `issuedAt.expiresAt.signature`)

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

## Client Module (`barstile/client`)

Import path:
```javascript
import {
  barstileFetch,
  solve,
  solveSync,
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
  * `maxRetries` (`number`, default: `1`): Maximum number of challenge retry attempts.
  * `solveOptions` (`Object`, optional): Options forwarded to `solve()` (`maxAttempts`, `yieldInterval`).

#### Behavior

1. Sends the initial HTTP request.
2. If the response status is not `449`, returns the response immediately.
3. If the response status is `449`:
   * Reads challenge token from `X-Barstile-Challenge` header or response JSON body.
   * Runs `solve()` to calculate the nonce.
   * Clones request headers and adds `X-Barstile-Solution: <challenge>:<nonce>`.
   * Re-executes the request and returns the final response.
4. If the response contains `X-Barstile-Clearance`, caches the clearance token in memory and automatically attaches it to subsequent `barstileFetch` requests.

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
