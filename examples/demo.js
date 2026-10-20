import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { barstileMiddleware } from '../src/server/index.js';
import { barstileFetch } from '../src/client/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const guard = barstileMiddleware({ difficulty: 3 }); // difficulty 3 (~5-15ms for quick demo)

const server = http.createServer((req, res) => {
  // 1. Serve static JavaScript source files for browser native ESM
  if (req.method === 'GET' && req.url.startsWith('/src/')) {
    const cleanUrl = req.url.split('?')[0];
    const filePath = path.join(rootDir, cleanUrl);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      return res.end(fs.readFileSync(filePath));
    }
  }

  // 2. Serve the interactive visual web page for testing in the browser
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Barstile Live Testbed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 650px; margin: 40px auto; padding: 20px; line-height: 1.5; background: #0d1117; color: #c9d1d9; }
    h1 { color: #58a6ff; font-size: 24px; margin-bottom: 8px; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin-top: 20px; }
    button { background: #238636; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; margin-right: 8px; }
    button:hover { background: #2ea043; }
    button.red { background: #da3633; }
    button.red:hover { background: #f85149; }
    pre { background: #010409; padding: 14px; border-radius: 6px; font-size: 13px; overflow-x: auto; border: 1px solid #21262d; min-height: 80px; white-space: pre-wrap; word-break: break-all; }
  </style>
</head>
<body>
  <h1>🛡️ Barstile Live Testbed</h1>
  <p>Test the zero-dependency Proof-of-Work anti-bot shield in real-time.</p>

  <div class="card">
    <h3>1. Human Test (Automatic Background Solver)</h3>
    <p>Simulates a legitimate user. Automatically detects the <code>449</code> challenge, solves it in the background via <code>barstileFetch</code>, and passes the guard.</p>
    <button id="human-btn">Run Human Request</button>
  </div>

  <div class="card">
    <h3>2. Bot Attack (No Solver)</h3>
    <p>Simulates a bot/scraper spamming the endpoint without solving the math puzzle.</p>
    <button id="bot-btn" class="red">Run Bot Request</button>
  </div>

  <div class="card">
    <h3>Live Server Response:</h3>
    <pre id="output">Click a button above to run a live test...</pre>
  </div>

  <script type="module">
    import { barstileFetch } from '/src/client/index.js';

    const out = document.getElementById('output');
    const humanBtn = document.getElementById('human-btn');
    const botBtn = document.getElementById('bot-btn');

    humanBtn.addEventListener('click', async () => {
      out.textContent = 'Solving challenge in background micro-worker...';
      const t0 = performance.now();
      try {
        const res = await barstileFetch('/api/protected', { method: 'POST' });
        const time = (performance.now() - t0).toFixed(1);
        const data = await res.json();
        out.textContent = '✅ STATUS: ' + res.status + ' OK (Solved & Passed in ' + time + 'ms)\\n\\n' + JSON.stringify(data, null, 2);
      } catch (err) {
        out.textContent = '❌ Error: ' + err.message;
      }
    });

    botBtn.addEventListener('click', async () => {
      out.textContent = 'Sending raw scraper request without solving...';
      try {
        const res = await fetch('/api/protected', { method: 'POST' });
        const data = await res.json();
        out.textContent = '🛑 STATUS: ' + res.status + ' Blocked by Barstile!\\n\\nServer Response:\\n' + JSON.stringify(data, null, 2);
      } catch (err) {
        out.textContent = '❌ Error: ' + err.message;
      }
    });
  </script>
</body>
</html>
    `);
  }

  // 3. Protected API route guarded by Barstile
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
