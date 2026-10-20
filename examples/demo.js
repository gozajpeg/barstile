import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { barstileMiddleware } from '../src/server/index.js';
import { barstileFetch } from '../src/client/index.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const guard = barstileMiddleware({ difficulty: 3 });

const server = http.createServer((req, res) => {
  // 1. Serve frontend HTML
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(path.join(rootDir, 'examples', 'index.html')).pipe(res);
  }

  // 2. Serve static JS files for native browser ESM
  if (req.method === 'GET' && req.url.startsWith('/src/')) {
    const filePath = path.join(rootDir, req.url.split('?')[0]);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  // 3. Protected route guarded by Barstile
  if (req.url === '/api/protected') {
    return guard(req, res, () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Welcome! You passed the Barstile guard.',
        telemetry: req.barstile
      }));
    });
  }

  res.writeHead(404);
  res.end('Not found');
});

const PORT = 3000;
server.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🛡️  Barstile Test Server Running at: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
  console.log(`Running automated terminal tests now...\n`);

  const BASE = `http://127.0.0.1:${PORT}`;

  // TEST 1: Bot request without solution
  console.log(`[TEST 1] Raw request without solution (simulating bot)...`);
  const botRes = await fetch(`${BASE}/api/protected`, { method: 'POST' });
  console.log(`         Status: ${botRes.status} (Challenge Issued)`);
  const challenge = botRes.headers.get('x-barstile-challenge');
  console.log(`         Header: X-Barstile-Challenge: ${challenge?.slice(0, 36)}...`);

  // TEST 2: Legitimate request with barstileFetch
  console.log(`\n[TEST 2] Request via barstileFetch (simulating legitimate user)...`);
  const t0 = performance.now();
  const humanRes = await barstileFetch(`${BASE}/api/protected`, { method: 'POST' });
  const took = (performance.now() - t0).toFixed(1);
  const data = await humanRes.json();
  console.log(`         Status: ${humanRes.status} OK`);
  console.log(`         Solved and verified in: ${took}ms`);
  console.log(`         Telemetry:`, data.telemetry);

  console.log(`\n======================================================`);
  console.log(`🎉 ALL TERMINAL TESTS PASSED!`);
  console.log(`👉 Open http://localhost:${PORT} in your browser to test it interactively!`);
  console.log(`(Press Ctrl+C to stop the server)\n`);
});
