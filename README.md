<div align="center">
  <img src="https://raw.githubusercontent.com/gozajpeg/barstile/main/assets/barstile.webp" alt="barstile logo" width="340" />
  <h1>barstile</h1>
  <p><strong>Zero-dependency Proof-of-Work anti-bot shield for Node.js, browsers, and APIs.</strong></p>
  <p>Applies asymmetric computational cost to automated scrapers without visual puzzles or third-party tracking cookies.</p>

  <p>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square" alt="node version" /></a>
    <a href="https://www.npmjs.com/package/barstile"><img src="https://img.shields.io/badge/npm-barstile-red.svg?style=flat-square" alt="npm package" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="license" /></a>
    <a href="https://github.com/gozajpeg"><img src="https://img.shields.io/badge/author-gozajpeg-blue.svg?style=flat-square" alt="author" /></a>
  </p>
</div>

---

## What Does Barstile Export?

Barstile has **zero external dependencies** and provides two clean entry points:

### 1. Server (`barstile/server`)
- `barstileMiddleware()`: Plug-and-play HTTP guard for native Node.js `http`, Express, Connect, or Fastify.
- `createBarstile()`: Standalone engine to generate challenges and verify solutions manually.

### 2. Client (`barstile/client`)
- `barstileFetch()`: Drop-in replacement for standard `fetch()` that detects challenges, solves them in the background, and retries automatically.
- `solve()`: Non-blocking asynchronous solver for custom UIs or Web Workers.
- `solveSync()`: Pure synchronous solver for background threads and scripts.

---

## Installation

```bash
npm install barstile
```

---

## 2-Minute Quickstart (Zero Configuration)

You do **not** need an `.env` file, an account, or any API keys. Barstile generates a secure 256-bit secret key in memory on boot.

### 1. Backend (Native Node.js `node:http`)

Works out of the box with zero external packages:

```javascript
import http from 'node:http';
import { barstileMiddleware } from 'barstile/server';

const guard = barstileMiddleware();

const server = http.createServer((req, res) => {
  // Pass request through the barstile guard
  guard(req, res, () => {
    // If request reached here, the client solved the challenge
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Welcome, verified human!' }));
  });
});

server.listen(3000);
```

*(If you use Express, it works the exact same way: `app.use('/api', barstileMiddleware())`)*

---

### 2. Frontend (Browser / Client)

Replace `fetch` with `barstileFetch`. It looks and acts identically to native `fetch()`, but automatically handles the challenge-response handshake in the background:

```javascript
import { barstileFetch } from 'barstile/client';

// Just like window.fetch:
const response = await barstileFetch('http://localhost:3000/api/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ item: 'example' })
});

const data = await response.json();
console.log(data); // { message: 'Welcome, verified human!' }
```

That's it. Real humans experience a brief background calculation (~20–50ms). Automated scrapers attempting 1,000 requests per second get overwhelmed by millions of SHA-256 operations.

---

## How It Works

```
[Browser / Client]                                           [Server]
        |                                                        |
        |  1. POST /api/data                                     |
        |------------------------------------------------------->|
        |                                                        | (No solution attached)
        |  2. 449 Retry With Barstile                            |
        |     Header: X-Barstile-Challenge: salt.diff.exp.sig    |
        |<-------------------------------------------------------| (Stateless HMAC)
        |                                                        |
        |  [barstileFetch background solver]                     |
        |  Finds nonce where SHA-256(salt + nonce) matches       |
        |                                                        |
        |  3. Retries original request with solution             |
        |     Header: X-Barstile-Solution: challenge:nonce       |
        |------------------------------------------------------->|
        |                                                        | (Single hash verification)
        |  4. 200 OK (Barstile unlocks, request proceeds)        |
        |<-------------------------------------------------------|
```

---

## Standalone / Manual API

If you don't want to use the HTTP middleware and prefer full manual control:

### Server: Manual Challenge & Verification

```javascript
import { createBarstile } from 'barstile/server';

const barstile = createBarstile({ difficulty: 4 });

// 1. Issue challenge token string
const challenge = barstile.issueChallenge();

// 2. Later, verify the solution submitted by client:
const result = barstile.verify(submittedSolution);

if (result.valid) {
  console.log('Passed!', result.nonce, result.hash);
} else {
  console.log('Rejected:', result.reason); // 'invalid_work' | 'challenge_expired' | 'replay_detected'
}
```

### Client: Manual Solver

```javascript
import { solve } from 'barstile/client';

const result = await solve(challengeToken, {
  onProgress: ({ attempts, durationMs }) => {
    console.log(`Calculated ${attempts} hashes in ${durationMs.toFixed(0)}ms`);
  }
});

console.log(result.solution); // "salt.diff.exp.sig:nonce"
```

---

## Difficulty Scaling

| Difficulty | Required Hex Zeros | Expected Hashes ($16^D$) | Est. Client Time (JS)* | Expected Hashes at 1,000 req/s |
| :---: | :---: | :---: | :---: | :---: |
| **1** | `0...` | ~16 | < 1 ms | 16,000 hashes/s |
| **2** | `00...` | ~256 | ~1 ms | 256,000 hashes/s |
| **3** | `000...` | ~4,096 | ~3–10 ms | 4,096,000 hashes/s |
| **4 (Default)** | `0000...` | ~65,536 | ~20–50 ms | 65,536,000 hashes/s |
| **5** | `00000...` | ~1,048,576 | ~300–800 ms | 1.04 Billion hashes/s |

*\*Estimated on modern desktop hardware running single-threaded JavaScript. Mobile or low-power devices take longer.*

---

## Security Model

1. **HMAC Challenge Integrity:** Challenges are signed with HMAC-SHA256 (`salt:difficulty:expiresAt`). If an attacker alters the difficulty or expiry parameter, the signature check fails immediately before any hashing occurs.
2. **Replay Mitigation:** Solved nonces are cached in an in-memory sliding window until their challenge expires. Submitting an identical solution twice returns `403 Forbidden`.
3. **Constant-Time Verification:** Signature validation uses `crypto.timingSafeEqual` to avoid timing side-channel leaks.
4. **Stateless Operations:** The server does not store pending challenges in a database; memory is only used for spent nonces until expiration.

---

## License

MIT © [gozajpeg](https://github.com/gozajpeg)
