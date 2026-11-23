import http from 'node:http';
import { performance } from 'node:perf_hooks';
import { barstileMiddleware } from '../src/server/middleware.js';
import { solveSync } from '../src/client/solver.js';

async function runConcurrentBenchmark() {
  const middleware = barstileMiddleware({
    difficulty: 2,
    clearanceTtlMs: 60000
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
  const url = `http://127.0.0.1:${port}/api/resource`;

  const totalRequests = 2000;
  const concurrencies = [10, 25, 50, 100];
  const results = [];

  for (const concurrency of concurrencies) {
    const latencies = [];
    const t0 = performance.now();
    let cursor = 0;

    const workers = Array.from({ length: concurrency }, async () => {
      while (cursor < totalRequests) {
        cursor++;
        const reqStart = performance.now();
        const res = await fetch(url);
        await res.text();
        latencies.push(performance.now() - reqStart);
      }
    });

    await Promise.all(workers);
    const duration = performance.now() - t0;
    latencies.sort((a, b) => a - b);

    const mem = process.memoryUsage();
    results.push({
      concurrency,
      totalRequests,
      durationMs: +duration.toFixed(1),
      reqPerSec: +((totalRequests / duration) * 1000).toFixed(0),
      p50Ms: +latencies[Math.floor(latencies.length * 0.5)].toFixed(2),
      p95Ms: +latencies[Math.floor(latencies.length * 0.95)].toFixed(2),
      p99Ms: +latencies[Math.floor(latencies.length * 0.99)].toFixed(2),
      rssMB: +(mem.rss / 1024 / 1024).toFixed(2),
      heapUsedMB: +(mem.heapUsed / 1024 / 1024).toFixed(2)
    });
  }

  server.close();
  console.log(JSON.stringify(results, null, 2));
}

runConcurrentBenchmark().catch(console.error);
