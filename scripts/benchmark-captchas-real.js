import https from 'node:https';
import { performance } from 'node:perf_hooks';
import fs from 'node:fs';
import path from 'node:path';
import { verifySolution, createBarstile } from '../src/server/index.js';
import { solveSync } from '../src/client/solver.js';

async function fetchUrlInfo(url) {
  const t0 = performance.now();
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const t1 = performance.now();
  const text = await res.text();
  const t2 = performance.now();

  return {
    url,
    status: res.status,
    downloadDurationMs: +(t2 - t0).toFixed(1),
    transferBytes: Number(res.headers.get('content-length')) || Buffer.byteLength(text, 'utf8'),
    unpackedBytes: Buffer.byteLength(text, 'utf8'),
    cookiesSet: Boolean(res.headers.get('set-cookie'))
  };
}

async function measureSiteverifyLatency(endpointUrl, payload) {
  const samples = [];
  for (let i = 0; i < 5; i++) {
    const t0 = performance.now();
    try {
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload
      });
      await res.text();
      samples.push(performance.now() - t0);
    } catch (e) {
      // Ignore network errors, capture timing
      samples.push(performance.now() - t0);
    }
  }
  samples.sort((a, b) => a - b);
  return {
    p50Ms: +samples[Math.floor(samples.length * 0.5)].toFixed(1),
    minMs: +samples[0].toFixed(1),
    maxMs: +samples[samples.length - 1].toFixed(1)
  };
}

async function runRealCaptchaBenchmark() {
  const results = {
    clientScripts: {},
    serverVerificationLatency: {},
    privacyAndDataSovereignty: {}
  };

  console.log('Fetching live client scripts...');

  // 1. Client script sizes
  // Turnstile
  results.clientScripts.turnstile = await fetchUrlInfo('https://challenges.cloudflare.com/turnstile/v0/api.js');
  // reCAPTCHA v3
  results.clientScripts.recaptchaV3 = await fetchUrlInfo('https://www.google.com/recaptcha/api.js?render=explicit');
  // hCaptcha
  results.clientScripts.hcaptcha = await fetchUrlInfo('https://js.hcaptcha.com/1/api.js?render=explicit');

  // Barstile Client Bundle (Built)
  const barstileClientPath = path.resolve('src/client/index.js');
  const barstileFiles = [
    'src/client/index.js',
    'src/client/solver.js',
    'src/client/fetch.js',
    'src/client/widget.js',
    'src/client/probe.js',
    'src/client/behavior.js',
    'src/client/clock.js'
  ];
  let barstileTotalBytes = 0;
  for (const f of barstileFiles) {
    if (fs.existsSync(f)) {
      barstileTotalBytes += fs.statSync(f).size;
    }
  }
  results.clientScripts.barstile = {
    unpackedBytes: barstileTotalBytes,
    transferBytes: Math.round(barstileTotalBytes * 0.35), // Gzip estimate
    downloadDurationMs: 0, // Bundled locally / self-hosted
    cookiesSet: false
  };

  console.log('Measuring server verification roundtrips...');

  // 2. Server verification latency
  // Cloudflare Turnstile siteverify
  results.serverVerificationLatency.turnstile = await measureSiteverifyLatency(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    'secret=fake_secret&response=fake_response'
  );

  // Google reCAPTCHA siteverify
  results.serverVerificationLatency.recaptcha = await measureSiteverifyLatency(
    'https://www.google.com/recaptcha/api/siteverify',
    'secret=fake_secret&response=fake_response'
  );

  // hCaptcha siteverify
  results.serverVerificationLatency.hcaptcha = await measureSiteverifyLatency(
    'https://api.hcaptcha.com/siteverify',
    'secret=fake_secret&response=fake_response'
  );

  // Barstile in-process local verification
  const engine = createBarstile({ difficulty: 2 });
  const chal = engine.issueChallenge();
  const sol = solveSync(chal);
  const localSamples = [];
  for (let i = 0; i < 1000; i++) {
    const t0 = performance.now();
    engine.verify(sol.solution);
    localSamples.push(performance.now() - t0);
  }
  localSamples.sort((a, b) => a - b);
  results.serverVerificationLatency.barstile = {
    p50Ms: +(localSamples[Math.floor(localSamples.length * 0.5)]).toFixed(3),
    minMs: +(localSamples[0]).toFixed(3),
    maxMs: +(localSamples[localSamples.length - 1]).toFixed(3)
  };

  console.log(JSON.stringify(results, null, 2));
}

runRealCaptchaBenchmark().catch(console.error);
