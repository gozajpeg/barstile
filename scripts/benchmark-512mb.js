import http from 'node:http';
import { performance } from 'node:perf_hooks';
import { barstileMiddleware } from '../src/server/middleware.js';
import { Barstile } from '../src/server/barstile.js';
import { solveSync } from '../src/client/solver.js';
import { ReplayCache, AllowanceCache } from '../src/core/cache.js';
import { TarpitTracker } from '../src/core/tarpit.js';

// Helper to record memory
function getMemMB() {
  const m = process.memoryUsage();
  return {
    rss: +(m.rss / 1024 / 1024).toFixed(2),
    heapTotal: +(m.heapTotal / 1024 / 1024).toFixed(2),
    heapUsed: +(m.heapUsed / 1024 / 1024).toFixed(2),
    external: +(m.external / 1024 / 1024).toFixed(2)
  };
}

async function runBenchmark() {
  const results = {
    baseline: {},
    challengeFlood: {},
    verifyFlow: {},
    cacheSaturation: [],
    headroomAnalysis: {}
  };

  // 1. Baseline Memory
  if (global.gc) global.gc();
  results.baseline = getMemMB();

  // 2. HTTP Server with barstileMiddleware
  const middleware = barstileMiddleware({
    difficulty: 2,
    clearanceTtlMs: 60000,
    allowSilentPass: false
  });

  const server = http.createServer((req, res) => {
    middleware(req, res, () => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'ok', barstile: req.barstile }));
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 3. Challenge Issuance Stress Test (Simulating 5,000 rapid unauthenticated requests)
    const challengeCount = 5000;
    const challengeSamples = [];
    const tStart = performance.now();
    const latencies = [];

    for (let i = 0; i < challengeCount; i++) {
      const t0 = performance.now();
      const res = await fetch(`${baseUrl}/api/protected`, {
        headers: { 'User-Agent': `BotSimulator/${i % 50}` }
      });
      const t1 = performance.now();
      latencies.push(t1 - t0);
      await res.text();

      if (i % 1000 === 0) {
        challengeSamples.push({
          request: i,
          ...getMemMB()
        });
      }
    }
    const tEnd = performance.now();
    const totalDuration = tEnd - tStart;
    latencies.sort((a, b) => a - b);

    results.challengeFlood = {
      totalRequests: challengeCount,
      durationMs: +totalDuration.toFixed(1),
      reqPerSec: +((challengeCount / totalDuration) * 1000).toFixed(0),
      latencyP50: +latencies[Math.floor(latencies.length * 0.5)].toFixed(2),
      latencyP95: +latencies[Math.floor(latencies.length * 0.95)].toFixed(2),
      latencyP99: +latencies[Math.floor(latencies.length * 0.99)].toFixed(2),
      finalMem: getMemMB()
    };

    // 4. Verify & Clearance Issuance Load (500 valid Proof-of-Work solves)
    // First obtain a challenge
    const resChal = await fetch(`${baseUrl}/api/protected`);
    const challengeHeader = resChal.headers.get('x-barstile-challenge');
    
    // Solve it
    const solved = solveSync(challengeHeader);

    // Hit server with valid solution and clearance
    const verifyLatencies = [];
    const tVerifyStart = performance.now();
    for (let i = 0; i < 500; i++) {
      const tv0 = performance.now();
      const res = await fetch(`${baseUrl}/api/protected`, {
        headers: {
          'X-Barstile-Solution': solved.solution,
          'User-Agent': 'LegitimateBrowser/1.0'
        }
      });
      const tv1 = performance.now();
      verifyLatencies.push(tv1 - tv0);
      await res.text();
    }
    const tVerifyEnd = performance.now();
    verifyLatencies.sort((a, b) => a - b);

    results.verifyFlow = {
      totalRequests: 500,
      durationMs: +(tVerifyEnd - tVerifyStart).toFixed(1),
      reqPerSec: +((500 / (tVerifyEnd - tVerifyStart)) * 1000).toFixed(0),
      latencyP50: +verifyLatencies[Math.floor(verifyLatencies.length * 0.5)].toFixed(2),
      latencyP95: +verifyLatencies[Math.floor(verifyLatencies.length * 0.95)].toFixed(2),
      latencyP99: +verifyLatencies[Math.floor(verifyLatencies.length * 0.99)].toFixed(2),
      finalMem: getMemMB()
    };

    // 5. Cache & Tarpit Memory Bounding Test (50,000 distinct entries in ReplayCache + 10,000 IPs in Tarpit)
    const replayCache = new ReplayCache({ maxSize: 50000, pruneIntervalMs: 0 });
    const tarpit = new TarpitTracker({ maxTrackedIps: 10000, pruneIntervalMs: 0 });

    const saturationPoints = [1000, 5000, 10000, 20000, 30000, 40000, 50000, 60000, 75000];
    const saturationSamples = [];

    const now = Date.now();
    for (let i = 1; i <= 75000; i++) {
      const key = `sol_hash_0000_${i}_abcdef1234567890`;
      replayCache.add(key, now + 60000);
      
      const ip = `192.168.${(i >> 8) % 255}.${i % 255}`;
      tarpit.recordRequest(ip, now);

      if (saturationPoints.includes(i)) {
        saturationSamples.push({
          entries: i,
          cacheSize: replayCache.entries.size,
          tarpitSize: tarpit.records.size,
          ...getMemMB()
        });
      }
    }

    results.cacheSaturation = saturationSamples;

    // 6. 512MB Render Headroom Analysis
    const peakMem = getMemMB();
    const renderLimitMB = 512;
    results.headroomAnalysis = {
      renderLimitMB,
      idleRssMB: results.baseline.rss,
      peakRssMB: peakMem.rss,
      peakHeapUsedMB: peakMem.heapUsed,
      freeMemoryRemainingMB: +(renderLimitMB - peakMem.rss).toFixed(2),
      utilizationPercentage: +((peakMem.rss / renderLimitMB) * 100).toFixed(1)
    };

  } finally {
    server.close();
  }

  console.log(JSON.stringify(results, null, 2));
}

runBenchmark().catch((err) => {
  console.error(err);
  process.exit(1);
});
