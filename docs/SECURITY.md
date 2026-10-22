# Barstile Security Model & Threat Assessment

This document outlines the security properties, threat model, boundaries, and trade-offs of Barstile.

---

## 1. Threat Model & Protections

### What Barstile Mitigates

* **Mass Scraping**: Scrapers attempting to extract thousands of pages per minute face quadratic computational scaling. At difficulty 4, an attacker sending 1,000 requests per second must compute ~65.5 million SHA-256 hashes per second.
* **Credential Stuffing & Form Spam**: Imposes an economic cost on automated submissions without requiring interactive CAPTCHA puzzles or third-party tracking scripts.
* **Brute-Force Endpoint Flooding**: Forces automated scripts to spend CPU time before the server executes database queries or business logic.

### What Barstile Does Not Mitigate

* **Network-Layer DDoS (L3/L4)**: Barstile runs inside the Node.js application layer. It does not replace network firewalls, reverse proxies, or cloud DDoS scrubbers.
* **Targeted, Slow Scraping**: An attacker requesting one page every 10 seconds will easily compute a difficulty 4 challenge without noticeable friction.
* **Distributed Botnets with Excess Compute**: A large botnet with thousands of distinct machines can distribute the PoW burden across nodes.

---

## 2. Cryptographic Integrity

### Tamper-Proof Challenge Tokens
Challenge tokens contain four parts: `salt.difficulty.expiresAt.signature`.
* The signature is generated with `crypto.createHmac('sha256', secret)`.
* If a client attempts to lower the difficulty (e.g. from 4 to 1) or extend the expiration time, the server rejects the signature before evaluating any proof-of-work.

### Timing Attack Resistance
Signature validation uses `crypto.timingSafeEqual` over fixed-length binary buffers:
```javascript
export function hmacVerify(data, secret, expectedSignature) {
  if (typeof expectedSignature !== 'string' || !secret) return false;
  const actualSignature = hmacSign(data, secret);
  const actualBuf = Buffer.from(actualSignature, 'hex');
  const expectedBuf = Buffer.from(expectedSignature, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}
```
This prevents attackers from deducing the server secret character-by-character through response timing variations.

### Replay Mitigation
A valid Proof-of-Work solution consists of `challenge:nonce`. Without replay prevention, an attacker could solve a challenge once and replay the same solution header across thousands of parallel requests until the challenge expired.

Barstile mitigates this using `ReplayCache`:
1. When a solution passes verification, the key `signature:nonce` is stored in the cache with the token's expiration timestamp.
2. If another request arrives with the same `signature:nonce`, the cache reports a match and returns `403 Forbidden` (`reason: replay_detected`).
3. Entries expire automatically when their parent challenge expires.

### Request Allowance Budget & Clearance Velocity Mitigation
Without a request quota, an attacker could solve 1 challenge once (taking ~20 ms of CPU) and use that clearance token to scrape 50,000 items during the 15-minute validity window.

Barstile neutralizes this attack via `AllowanceCache` (or atomic Redis `INCR` in clusters):
1. Each clearance token is allocated a request quota (default: 100 requests).
2. The remaining quota is tracked per token signature and exposed via `X-Barstile-Remaining`.
3. When the quota reaches zero, the clearance is revoked and a fresh HTTP 449 challenge is issued.
4. Scraping 100,000 items forces the bot to solve 1,000 separate PoW challenges (65.5 million hashes), turning scraping into a high-cost compute bottleneck.
5. Legitimate human users rarely exceed 100 requests per 15 minutes; when they do, `barstileFetch` solves the renewal in ~20 ms in the background with zero user disruption.

---

## 3. Trade-offs & Operational Considerations

### Client Resource Usage
Proof-of-Work transfers computational burden from the server to the client.
* **Desktop devices**: Difficulty 3 to 4 is negligible (typically 5 to 50 ms of CPU time).
* **Mobile & low-power devices**: Computing 65,000 hashes on an older mobile CPU or low-end device can take 100 to 300 ms and consumes battery.
* **Recommendation**: Use difficulty 3 for general consumer APIs, and increase to difficulty 4 only on high-risk routes (e.g. login, registration, checkout, search).

### Memory Footprint
The server's memory usage depends on the replay cache size:
* Each cache entry stores a string key and integer timestamp (~100 bytes in V8).
* At default capacity (50,000 entries), the cache consumes approximately 5 MB of memory.
* If memory is constrained, set `maxSize` to a lower threshold when initializing the middleware.

### Multi-Instance & Clustered Deployments
* **Secret Synchronization**: If running multiple Node.js server instances behind a load balancer, provide the same `secret` string to all instances (for example, via an environment variable).
* **Multi-Server Defense Without Redis**: By default, Barstile cryptographically binds both challenge tokens and clearance tokens to the client IP subnet (`/24` for IPv4, `/64` for IPv6) and User-Agent hash. A challenge solved on one server cannot be submitted by another client or bot machine on a different server, preventing cross-datacenter replay even with zero shared infrastructure.
* **Clustered Replay Defense With Redis**: For large-scale distributed deployments where the same client might race requests across different pods, pass your existing Redis client directly (`barstileMiddleware({ redis })`). Barstile executes atomic `SET key 1 EX ttl NX` commands with zero race windows and automatically falls back to local memory if Redis disconnects.
