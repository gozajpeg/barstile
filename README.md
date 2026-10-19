<div align="center">
  <img src="https://raw.githubusercontent.com/gozajpeg/barstile/main/assets/barstileLogo.webp" alt="barstile logo" width="340" />
  <h1>barstile</h1>
  <p><strong>Zero-dependency Proof-of-Work anti-bot turnstile for Node.js, browsers, and APIs.</strong></p>
  <p>Applies asymmetric computational cost to automated scrapers without visual puzzles or third-party tracking cookies.</p>

  <p>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square" alt="node version" /></a>
    <a href="https://www.npmjs.com/package/barstile"><img src="https://img.shields.io/badge/npm-barstile-red.svg?style=flat-square" alt="npm package" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="license" /></a>
    <a href="https://github.com/gozajpeg"><img src="https://img.shields.io/badge/author-gozajpeg-blue.svg?style=flat-square" alt="author" /></a>
  </p>
</div>

---

Traditional CAPTCHAs interrupt users with visual image puzzles, while commercial cloud widgets often track client telemetry and require external infrastructure.

**Barstile** provides a self-hosted, headless alternative: your server issues an HMAC-signed cryptographic challenge when protection is needed. Legitimate clients solve the challenge in the background using native SHA-256, while automated scripts attempting high-frequency requests face significant computational overhead.

- **Zero dependencies:** Standard `node:crypto` on the server; pure typed-array SHA-256 in the browser.
- **Headless:** Operates via HTTP headers (`449 Retry With`) without DOM widgets or checkboxes.
- **Zero-config:** Generates an in-memory 256-bit HMAC secret on startup if none is specified.
- **Stateless verification:** The server validates solutions with a single SHA-256 hash check and zero database queries.
- **Replay mitigation:** Bounded in-memory cache rejects nonces reused within their challenge validity window.

---

## How It Works

```
[Browser / Client]                                           [Server]
        |                                                        |
        |  1. POST /api/login                                    |
        |------------------------------------------------------->|
        |                                                        | (Challenge triggered)
        |  2. 449 Retry With Turnstile                           |
        |     Header: X-Barstile-Challenge: salt.diff.exp.sig    |
        |<-------------------------------------------------------| (Stateless HMAC)
        |                                                        |
        |  [BACKGROUND SOLVER]                                   |
        |  Calculates SHA-256 nonces until target matches.       |
        |                                                        |
        |  3. Retries original request with solution             |
        |     Header: X-Barstile-Solution: challenge:nonce       |
        |------------------------------------------------------->|
        |                                                        | (Single hash check, no DB reads)
        |  4. 200 OK (Turnstile turns, request proceeds)         |
        |<-------------------------------------------------------|
```

---

## Installation

```bash
npm install barstile
```

---

## Quickstart

### 1. Backend (Express / Connect / Node.js)

Drop it directly into your route. Zero configuration required:

```javascript
import express from 'express';
import { barstileMiddleware } from 'barstile/server';

const app = express();

// Protect sensitive endpoints (login, checkout, scraping targets)
app.post('/api/login', barstileMiddleware(), (req, res) => {
  res.json({ success: true, user: req.body.email });
});

app.listen(3000);
```

#### Custom Options (Optional)

```javascript
app.use(barstileMiddleware({
  difficulty: 4,          // Number of leading hex zeros required (default: 4)
  ttlMs: 60000,           // Challenge expires in 60s (default: 60000)
  secret: process.env.POW_SECRET, // Optional shared key for multi-server clusters
  shouldChallenge: (req) => req.url.startsWith('/api/') // Conditional protection
}));
```

---

### 2. Frontend (Browser / Client)

Use `barstileFetch` as a drop-in replacement for native `fetch()`. It transparently intercepts `449` challenges, computes the solution in the background, and retries the request automatically:

```javascript
import { barstileFetch } from 'barstile/client';

// Looks and behaves just like standard fetch:
const response = await barstileFetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'secretpassword' })
});

const data = await response.json();
```

---

## Manual Solver API

If you prefer building your own custom UI or background worker:

```javascript
import { solve, solveSync } from 'barstile/client';

// Asynchronous solver (non-blocking, yields every 25,000 iterations to keep UI at 60 FPS)
const result = await solve(challengeToken, {
  onProgress: ({ attempts, durationMs }) => {
    console.log(`Solved ${attempts} hashes in ${durationMs.toFixed(0)}ms`);
  }
});

console.log(result.solution); // "salt.diff.exp.sig:49201"
```

Inside a Web Worker or Node script where you want maximum raw speed:

```javascript
import { solveSync } from 'barstile/client';

const result = solveSync(challengeToken);
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

*\*Estimated on modern desktop hardware running single-threaded JavaScript. Actual client duration varies based on device hardware, browser engine, and thermal state.*

For occasional human requests (e.g. login, comment submission), the background computation is typically brief. For automated scrapers sending thousands of requests concurrently, the cumulative CPU work scales exponentially with difficulty.

---

## Security Model

1. **HMAC Challenge Integrity:** Challenges are signed with HMAC-SHA256 (`salt:difficulty:expiresAt`). If a client alters the difficulty or expiry parameter, the signature check fails immediately before any hashing occurs.
2. **Replay Mitigation:** Solved nonces are recorded in an in-memory cache until the challenge expires. Re-submitting an identical `{challenge, nonce}` pair within that window returns `403 Forbidden`. Note: Under extreme request volumes exceeding `maxSize` (default 50,000), older entries are evicted to preserve server memory.
3. **Constant-Time Verification:** Signature validation uses `crypto.timingSafeEqual` to avoid timing side-channel leaks.
4. **Stateless Operations:** The server does not store active challenges in memory or databases; state is only kept for spent nonces until expiration.

---

## License

MIT © [gozajpeg](https://github.com/gozajpeg)
