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

## Documentation Guides

* [API Reference](docs/API.md): Complete parameter tables, options, and return types for server and client.
* [Architecture & Protocol](docs/ARCHITECTURE.md): Token format, HTTP 449 handshake sequence, and replay cache lifecycle.
* [Security Model](docs/SECURITY.md): Threat mitigation boundaries, timing attack defense, and cluster considerations.

---

## What Does Barstile Export?

Barstile has **zero external dependencies** and provides two clean entry points:

### 1. Server (`barstile/server`)
* `barstileMiddleware()`: HTTP middleware for native Node.js `http`, Express, Connect, or Fastify.
* `createBarstile()`: Engine to generate challenges and verify solutions programmatically.

### 2. Client (`barstile/client`)
* `barstileFetch()`: Wrapper around `fetch()` that detects challenges, solves them in the background, and retries automatically.
* `solve()`: Non-blocking asynchronous solver for browser interfaces and Web Workers.
* `solveSync()`: Synchronous solver for background threads and scripts.

---

## Installation

```bash
npm install barstile
```

---

## Quickstart

### 1. Backend (Native Node.js `node:http`)

```javascript
import http from 'node:http';
import { barstileMiddleware } from 'barstile/server';

const guard = barstileMiddleware({ difficulty: 3 });

const server = http.createServer((req, res) => {
  guard(req, res, () => {
    // Reached only after client solves the challenge
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Access granted',
      telemetry: req.barstile
    }));
  });
});

server.listen(3000);
```

*(Express usage is identical: `app.use('/api', barstileMiddleware({ difficulty: 3 }))`)*

---

### 2. Frontend (Browser / Client)

Replace `fetch` with `barstileFetch`. It uses the standard `fetch()` signature, but automatically resolves the challenge-response handshake in the background:

```javascript
import { barstileFetch } from 'barstile/client';

const response = await barstileFetch('http://localhost:3000/api/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'checkout' })
});

const data = await response.json();
console.log(data); // { message: 'Access granted', ... }
```

Legitimate users experience a brief background calculation (typically 2 to 50 ms depending on difficulty and device CPU). Automated scrapers attempting 1,000 requests per second must compute millions of SHA-256 operations per second.

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

## Standalone / Programmatic API

If you do not want to use the HTTP middleware:

### Server: Manual Challenge & Verification

```javascript
import { createBarstile } from 'barstile/server';

const barstile = createBarstile({ difficulty: 4 });

// 1. Issue challenge token string
const challenge = barstile.issueChallenge();

// 2. Later, verify the solution submitted by client:
const result = barstile.verify(submittedSolution);

if (result.valid) {
  console.log('Passed:', result.nonce, result.hash);
} else {
  console.log('Rejected:', result.reason); // 'invalid_work' | 'challenge_expired' | 'replay_detected' | 'invalid_signature'
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

| Difficulty | Required Hex Zeros | Expected Hashes ($16^d$) | Est. Client Time (JS)* | Expected Hashes at 1,000 req/s |
| :---: | :---: | :---: | :---: | :---: |
| **1** | `0...` | 16 | < 1 ms | 16,000 hashes/s |
| **2** | `00...` | 256 | < 1 ms | 256,000 hashes/s |
| **3** | `000...` | 4,096 | 2 to 15 ms | 4,096,000 hashes/s |
| **4 (Default)** | `0000...` | 65,536 | 20 to 80 ms | 65,536,000 hashes/s |
| **5** | `00000...` | 1,048,576 | 300 to 1,200 ms | 1.04 Billion hashes/s |

*\*Estimated on modern desktop hardware running single-threaded JavaScript. Mobile or low-power devices take longer. Statistical expectation is exactly $16^d$.*

---

## Security Model Overview

1. **HMAC Challenge Integrity**: Challenges are signed with HMAC-SHA256 (`salt:difficulty:expiresAt`). If an attacker alters the difficulty or expiry parameter, the signature check fails immediately before any hashing occurs.
2. **Replay Mitigation**: Solved nonces are cached in an in-memory sliding window until their challenge expires. Submitting an identical solution twice returns `403 Forbidden`.
3. **Constant-Time Verification**: Signature validation uses `crypto.timingSafeEqual` to avoid timing side-channel leaks.
4. **Stateless Operations**: The server does not store pending challenges in a database; memory is only used for spent nonces until expiration.

See [docs/SECURITY.md](docs/SECURITY.md) for full threat model details.

---

## License

MIT (c) [gozajpeg](https://github.com/gozajpeg)
