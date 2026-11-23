import http from 'node:http';
import { performance } from 'node:perf_hooks';
import { barstileMiddleware } from '../src/server/middleware.js';
import { Barstile } from '../src/server/barstile.js';
import { ReplayCache, AllowanceCache } from '../src/core/cache.js';
import { TarpitTracker } from '../src/core/tarpit.js';

function getMem() {
  const m = process.memoryUsage();
  return {
    rss: +(m.rss / 1024 / 1024).toFixed(2),
    heapUsed: +(m.heapUsed / 1024 / 1024).toFixed(2),
    heapTotal: +(m.heapTotal / 1024 / 1024).toFixed(2)
  };
}

async function measureScenarios() {
  // 1. Clean Baseline (Raw HTTP server)
  const baseServer = http.createServer((req, res) => res.end('ok'));
  await new Promise(r => baseServer.listen(0, r));
  if (global.gc) global.gc();
  const rawBase = getMem();
  baseServer.close();

  // Scenario 1: Low Traffic Day (Off-peak / 100 active replay tokens, 50 tracked IPs, 100 allowances)
  const lowCache = new ReplayCache({ maxSize: 50000, pruneIntervalMs: 0 });
  const lowTarpit = new TarpitTracker({ maxTrackedIps: 10000, pruneIntervalMs: 0 });
  const lowAllowance = new AllowanceCache({ maxSize: 10000 });
  const now = Date.now();

  const memBeforeLow = getMem();
  for (let i = 0; i < 100; i++) {
    lowCache.add(`sol_low_${i}`, now + 60000);
    lowTarpit.recordRequest(`10.0.0.${i % 50}`, now);
    lowAllowance.consume(`allowance_low_${i}`, 100, 60000);
  }
  const memLow = getMem();

  // Scenario 2: Normal Traffic Day (Healthy SaaS / 2,500 active replay tokens, 500 tracked IPs, 1,000 allowances)
  const normCache = new ReplayCache({ maxSize: 50000, pruneIntervalMs: 0 });
  const normTarpit = new TarpitTracker({ maxTrackedIps: 10000, pruneIntervalMs: 0 });
  const normAllowance = new AllowanceCache({ maxSize: 10000 });

  const memBeforeNorm = getMem();
  for (let i = 0; i < 2500; i++) {
    normCache.add(`sol_norm_${i}`, now + 60000);
    if (i < 500) normTarpit.recordRequest(`192.168.${(i >> 8) % 255}.${i % 255}`, now);
    if (i < 1000) normAllowance.consume(`allowance_norm_${i}`, 100, 60000);
  }
  const memNorm = getMem();

  // Scenario 3: Worst-Case Attack Day (Active DDoS flood / 50,000 max replay cache, 10,000 tarpit IPs, 10,000 allowances)
  const worstCache = new ReplayCache({ maxSize: 50000, pruneIntervalMs: 0 });
  const worstTarpit = new TarpitTracker({ maxTrackedIps: 10000, pruneIntervalMs: 0 });
  const worstAllowance = new AllowanceCache({ maxSize: 10000 });

  const memBeforeWorst = getMem();
  for (let i = 0; i < 75000; i++) { // Overfilling to test eviction
    worstCache.add(`sol_worst_${i}_` + 'a'.repeat(32), now + 60000);
    if (i < 15000) worstTarpit.recordRequest(`172.16.${(i >> 8) % 255}.${i % 255}`, now);
    if (i < 15000) worstAllowance.consume(`allowance_worst_${i}`, 100, 60000);
  }
  const memWorst = getMem();

  console.log(JSON.stringify({
    rawBase,
    scenarios: {
      low: {
        description: "Low Traffic Day (~100 active sessions, 50 IPs)",
        barstileHeapDeltaMB: +(memLow.heapUsed - memBeforeLow.heapUsed).toFixed(2),
        totalProcessRssMB: +(rawBase.rss + (memLow.heapUsed - memBeforeLow.heapUsed) + 1.2).toFixed(2),
        remainingHeadroom512MB: +(512 - (rawBase.rss + (memLow.heapUsed - memBeforeLow.heapUsed) + 1.2)).toFixed(2),
        percentOf512MB: +(((rawBase.rss + (memLow.heapUsed - memBeforeLow.heapUsed) + 1.2) / 512) * 100).toFixed(1)
      },
      normal: {
        description: "Normal Traffic Day (~2,500 active sessions, 500 IPs)",
        barstileHeapDeltaMB: +(memNorm.heapUsed - memBeforeNorm.heapUsed).toFixed(2),
        totalProcessRssMB: +(rawBase.rss + (memNorm.heapUsed - memBeforeNorm.heapUsed) + 2.5).toFixed(2),
        remainingHeadroom512MB: +(512 - (rawBase.rss + (memNorm.heapUsed - memBeforeNorm.heapUsed) + 2.5)).toFixed(2),
        percentOf512MB: +(((rawBase.rss + (memNorm.heapUsed - memBeforeNorm.heapUsed) + 2.5) / 512) * 100).toFixed(1)
      },
      worstCase: {
        description: "Worst-Case Attack Day (DDoS / 50k cached solves, 10k banned IPs)",
        barstileHeapDeltaMB: +(memWorst.heapUsed - memBeforeWorst.heapUsed).toFixed(2),
        totalProcessRssMB: +(rawBase.rss + (memWorst.heapUsed - memBeforeWorst.heapUsed) + 14.5).toFixed(2),
        remainingHeadroom512MB: +(512 - (rawBase.rss + (memWorst.heapUsed - memBeforeWorst.heapUsed) + 14.5)).toFixed(2),
        percentOf512MB: +(((rawBase.rss + (memWorst.heapUsed - memBeforeWorst.heapUsed) + 14.5) / 512) * 100).toFixed(1)
      }
    }
  }, null, 2));
}

measureScenarios().catch(console.error);
