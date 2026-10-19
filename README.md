<div align="center">
  <img src="https://raw.githubusercontent.com/gozajpeg/barstile/main/assets/barstileLogo.webp" alt="barstile logo" width="340" />
  <h1>barstile</h1>
  <p><strong>The zero-dependency, invisible Proof-of-Work turnstile for Node.js, browsers, and APIs.</strong></p>
  <p>Real humans pass through in ~25ms without visual puzzles. Automated scrapers and bot farms get stopped by pure math.</p>

  <p>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square" alt="node version" /></a>
    <a href="https://www.npmjs.com/package/barstile"><img src="https://img.shields.io/badge/npm-barstile-red.svg?style=flat-square" alt="npm package" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="license" /></a>
    <a href="https://github.com/gozajpeg"><img src="https://img.shields.io/badge/author-gozajpeg-blue.svg?style=flat-square" alt="author" /></a>
  </p>
</div>

---

Traditional CAPTCHAs force real users to click crosswalks and bicycles. Third-party cloud widgets track user IPs and charge monthly enterprise fees.

**Barstile** takes a different approach: it puts a cryptographic turnstile in front of your endpoints. Real human visitors solve a tiny 25ms SHA-256 puzzle in the background without noticing. Automated scrapers and bot farms attempting 1,000 requests per second pin their CPUs to 100% and get stopped by pure physics.

- **Zero dependencies:** Pure Node.js `node:crypto` on the server, pure typed-array SHA-256 on the client.
- **Invisible:** No checkboxes, no visual puzzles, and no tracking cookies.
- **Zero-config:** Auto-generates a secure in-memory HMAC secret on boot.
- **Stateless verification:** The server validates challenges in ~0.02ms with zero database lookups.
- **Replay-proof:** Automatic bounded in-memory cache rejects reused nonces.

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
        |  Takes ~25ms on human hardware (invisible).            |
        |                                                        |
        |  3. Retries original request with solution             |
        |     Header: X-Barstile-Solution: challenge:nonce       |
        |------------------------------------------------------->|
        |                                                        | (Single hash check, ~0.02ms)
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

| Difficulty | Leading Hex Zeros | Average Hashes | Human Time (JS) | Bot at 1,000 req/s |
| :---: | :---: | :---: | :---: | :---: |
| **1** | `0...` | ~16 | < 1 ms | 16,000 hashes/s |
| **2** | `00...` | ~256 | ~1 ms | 256,000 hashes/s |
| **3** | `000...` | ~4,096 | ~3 ms | 4,096,000 hashes/s |
| **4 (Default)** | `0000...` | ~65,536 | ~25–40 ms | 65,536,000 hashes/s |
| **5** | `00000...` | ~1,048,576 | ~400 ms | 1.04 Billion hashes/s |

A human submitting a form once every few minutes will never notice a 25ms calculation. An automated scraping script trying to crawl 500 pages per second will see its concurrency collapse as CPU consumption surges by millions of operations.

---

## Security Model

1. **Tamper-Proof Challenges:** Challenges are signed with HMAC-SHA256 (`salt:difficulty:expiresAt`). If an attacker alters the difficulty from `4` to `1`, the server rejects it before doing any hashing.
2. **Replay Protection:** Solved nonces are cached in an in-memory ring buffer until their challenge expiration timestamp. Re-submitting the exact same solution returns `403 Forbidden`.
3. **No Timing Attacks:** Signature verification uses constant-time comparison (`crypto.timingSafeEqual`) to prevent side-channel timing leaks.
4. **Bounded Memory:** The anti-replay cache automatically evicts expired entries on a sliding window, keeping server memory footprint small and predictable.

---

## License

MIT © [gozajpeg](https://github.com/gozajpeg)
