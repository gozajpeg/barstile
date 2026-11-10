import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Copy, Check, ChevronRight, ChevronLeft, ChevronDown, BookOpen } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Documentation Hierarchy & Categories                                       */
/* -------------------------------------------------------------------------- */
const CATEGORIES = [
  {
    name: 'Getting Started',
    items: ['quickstart']
  },
  {
    name: 'Integration',
    items: ['server', 'client', 'react']
  },
  {
    name: 'Core Guides',
    items: ['difficulty', 'cluster']
  },
  {
    name: 'Reference & Security',
    items: ['security', 'api']
  }
];

const DOC_SECTIONS = [
  {
    id: 'quickstart',
    category: 'Getting Started',
    title: 'Quickstart Guide',
    summary: 'Protect endpoints and forms from automated scrapers in under five minutes.',
    steps: [
      {
        num: '1',
        title: 'Installation',
        desc: 'Install the core package from the npm registry.',
        code: 'npm install barstile'
      },
      {
        num: '2',
        title: 'Mount Middleware (Node.js / Express)',
        desc: 'Intercepts incoming requests and validates proof-of-work before handler execution.',
        code: `import http from 'node:http';
import { barstileMiddleware } from 'barstile/server';

const guard = barstileMiddleware({ difficulty: 3 });

const server = http.createServer((req, res) => {
  guard(req, res, () => {
    // Reached only after client solves the challenge
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Access granted' }));
  });
});

server.listen(3000);`
      },
      {
        num: '3',
        title: 'Swap Native Fetch with barstileFetch',
        desc: 'Automatically intercepts HTTP 449 challenges and solves nonces off the main thread in a Web Worker.',
        code: `import { barstileFetch } from 'barstile/client';

const response = await barstileFetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ item: 'Widget', qty: 1 })
});

const data = await response.json();`
      }
    ]
  },
  {
    id: 'server',
    category: 'Integration',
    title: 'Server Middleware',
    summary: 'Framework-agnostic request verification before body parsers allocate memory.',
    desc: 'barstileMiddleware runs natively with Express, Fastify, Connect, and standard node:http servers.',
    frameworks: [
      {
        id: 'express',
        name: 'Express',
        code: `import express from 'express';
import { barstileMiddleware } from 'barstile/server';

const app = express();

// 1. Mount Barstile BEFORE body parsers to reject bots before allocating memory
app.use(barstileMiddleware({
  difficulty: 3,
  ttlMs: 60000,
  routes: {
    '/public/*': 1,                                       // Fast browsing
    'POST /api/login': 5,                                 // High defense
    'POST /checkout': { difficulty: 4, clearance: false } // Fresh solve per order
  }
}));

// 2. Body parsers run ONLY after client solves challenge
app.use(express.json());

// 3. Protected endpoint - req.barstile contains verified solve metadata
app.post('/api/login', (req, res) => {
  const { verified, riskScore } = req.barstile;
  res.json({ success: true, verified, riskScore });
});

app.listen(3000, () => {
  console.log('Express server running on http://localhost:3000');
});`
      },
      {
        id: 'fastify',
        name: 'Fastify',
        code: `import Fastify from 'fastify';
import { barstileMiddleware } from 'barstile/server';

const fastify = Fastify({ logger: true });
const guard = barstileMiddleware({ difficulty: 3 });

// 1. Intercept requests in onRequest hook before body parsing
fastify.addHook('onRequest', (request, reply, done) => {
  guard(request.raw, reply.raw, done);
});

// 2. Protected endpoint handler
fastify.post('/api/login', async (request, reply) => {
  const barstile = request.raw.barstile || {};
  return { success: true, verified: barstile.verified };
});

await fastify.listen({ port: 3000 });
console.log('Fastify server running on http://localhost:3000');`
      },
      {
        id: 'node',
        name: 'Node.js (http)',
        code: `import http from 'node:http';
import { barstileMiddleware } from 'barstile/server';

const guard = barstileMiddleware({ difficulty: 3 });

const server = http.createServer((req, res) => {
  // Pure zero-dependency Node.js HTTP server
  guard(req, res, () => {
    if (req.method === 'POST' && req.url === '/api/login') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        verified: req.barstile.verified
      }));
      return;
    }

    res.writeHead(404);
    res.end();
  });
});

server.listen(3000, () => {
  console.log('Node.js server listening on http://localhost:3000');
});`
      }
    ],
    capabilities: [
      {
        title: 'Zero Heap Waste',
        desc: 'Rejects invalid or missing proofs before body parsers buffer request payloads into Node.js memory.'
      },
      {
        title: 'Route-Specific Scaling',
        desc: 'Configure lightweight difficulty (1–2) for read routes and higher difficulty (4–5) for write or auth endpoints.'
      },
      {
        title: 'Stateless or Clustered',
        desc: 'Runs zero-dependency in RAM by default, or with RedisReplayStore for clustered multi-container fleets.'
      }
    ]
  },
  {
    id: 'client',
    category: 'Integration',
    title: 'Client Fetch & HTML Widget',
    summary: 'Zero-cookie browser verification for fetch requests and HTML forms.',
    desc: 'Protect HTML forms without third-party tracking cookies or visual CAPTCHA puzzles.',
    code: `<form action="/login" method="POST">
  <input type="text" name="username" required />
  <input type="password" name="password" required />

  <!-- Automatically mounts self-hosted verification box -->
  <div class="barstile-widget"></div>

  <button type="submit">Sign in</button>
</form>

<script type="module">
  import { autoInitializeWidgets } from 'barstile/client';
  autoInitializeWidgets();
</script>`,
    capabilities: [
      {
        title: 'Off-Thread Web Worker',
        desc: 'Cryptographic SHA-256 nonces are computed in a background worker without dropping UI animation frames.'
      },
      {
        title: 'Automatic Retry',
        desc: 'barstileFetch catches 449 challenge responses, computes the nonce token, and retries original requests transparently.'
      }
    ]
  },
  {
    id: 'react',
    category: 'Integration',
    title: 'React & Web Component',
    summary: 'SSR-safe component for Next.js, Remix, and standard React applications.',
    desc: 'Drop-in interactive widget component designed for React 18+ and server-rendered frameworks.',
    code: `import React, { useState } from 'react';
import { BarstileWidget } from 'barstile/react';

export default function LoginForm() {
  const [token, setToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-barstile-solution': token // Attached solution token
      },
      body: JSON.stringify({ email: e.target.email.value })
    });
    const data = await res.json();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" required />
      
      {/* Interactive Turnstile-style PoW Widget */}
      <BarstileWidget
        mode="interactive"
        onSuccess={(solvedToken) => setToken(solvedToken)}
      />

      <button type="submit" disabled={!token}>
        Log in
      </button>
    </form>
  );
}`
  },
  {
    id: 'difficulty',
    category: 'Core Guides',
    title: 'Difficulty Tuning',
    summary: 'Exponential cost scaling for scrapers without noticeable latency for human visitors.',
    desc: 'SHA-256 target search scales exponentially with difficulty bits (16ᵈ). Choose the right level for your traffic profile.',
    table: {
      headers: ['Difficulty', 'Hex Prefix', 'Expected Hashes (16ᵈ)', 'Typical Solve Time'],
      rows: [
        ['1', '0...', '16', '< 2 ms'],
        ['2', '00...', '256', '< 5 ms'],
        ['3 (Recommended for Web)', '000...', '4,096', '5 to 25 ms'],
        ['4 (Engine Default)', '0000...', '65,536', '50 to 300 ms'],
        ['5', '00000...', '1,048,576', '1 to 10 s']
      ]
    }
  },
  {
    id: 'cluster',
    category: 'Core Guides',
    title: 'Distributed Clusters & Redis',
    summary: 'Atomic nonce verification across multi-pod Kubernetes fleets and container clusters.',
    desc: 'Single-server instances work out-of-the-box in RAM. For multi-node Kubernetes or clustered fleets, provide an existing Redis instance.',
    code: `import Redis from 'ioredis';
import { barstileMiddleware } from 'barstile/server';

const redis = new Redis(process.env.REDIS_URL);

app.use(barstileMiddleware({
  secret: process.env.BARSTILE_SECRET, // Shared secret across pods
  redis                                 // Atomic distributed replay store
}));`
  },
  {
    id: 'security',
    category: 'Reference & Security',
    title: 'Threat Model & Boundaries',
    summary: 'Technical boundaries defining what Barstile mitigates and what requires cloud WAF.',
    mitigates: [
      'High-volume scrapers making hundreds of automated requests per minute.',
      'Credential stuffing and repetitive form submission bots.',
      'Pre-challenge payload memory exhaustion by rejecting unverified connections early.',
      'Distributed replay attacks across clustered servers when paired with Redis.'
    ],
    requiresWaf: [
      'Layer 3/4 network volumetric DDoS floods (requires cloud CDN or edge DDoS scrubbing).',
      'Slow, low-frequency scrapers requesting 1 item every 10 seconds.',
      'Targeted human solve farms.'
    ]
  },
  {
    id: 'api',
    category: 'Reference & Security',
    title: 'API Options Reference',
    summary: 'Supported configuration parameters for barstileMiddleware().',
    table: {
      headers: ['Option', 'Type', 'Default', 'Description'],
      rows: [
        ['difficulty', 'number', '4', 'Number of leading hex zeros required (range 1 to 8). Set 3 for web forms.'],
        ['ttlMs', 'number', '60000', 'Challenge validity window in milliseconds.'],
        ['clearance', 'boolean', 'true', 'Issue persistent clearance token on successful solve.'],
        ['clearanceQuota', 'number', '100', 'Maximum requests allowed per clearance token before re-solve.'],
        ['tarpit', 'object', 'undefined', 'Rate-limiting and delay quarantine configuration for abusive IPs.']
      ]
    }
  }
];

/* -------------------------------------------------------------------------- */
/* Code Block Component with Copy Feedback                                     */
/* -------------------------------------------------------------------------- */
function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Graceful fallback
    }
  };

  return (
    <div className="relative rounded-xl bg-black/80 border border-white/[0.08] p-3.5 sm:p-5 font-mono text-xs sm:text-[13px] text-zinc-200 overflow-x-auto group">
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 p-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.08] text-zinc-400 hover:text-white transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
        title="Copy snippet"
        aria-label="Copy code snippet"
      >
        {copied ? (
          <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-sans text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Copied</span>
          </span>
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
      <pre className="pr-10 sm:pr-12 leading-relaxed overflow-x-auto font-mono">{code}</pre>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main DocsPage Component                                                    */
/* -------------------------------------------------------------------------- */
export function DocsPage({ onNavigate }) {
  const [activeId, setActiveId] = useState('quickstart');
  const [selectedFramework, setSelectedFramework] = useState('express');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentIdx = DOC_SECTIONS.findIndex((s) => s.id === activeId);
  const activeDoc = DOC_SECTIONS[currentIdx] || DOC_SECTIONS[0];
  const prevSection = currentIdx > 0 ? DOC_SECTIONS[currentIdx - 1] : null;
  const nextSection = currentIdx < DOC_SECTIONS.length - 1 ? DOC_SECTIONS[currentIdx + 1] : null;

  const handleSelectSection = (id) => {
    setActiveId(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-6 sm:pt-14 pb-20 sm:pb-24 px-4 sm:px-6 max-w-5xl mx-auto w-full">
      {/* Editorial Header */}
      <div className="pb-8 sm:pb-12 border-b border-white/[0.08]">
        <button
          onClick={() => {
            onNavigate('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-4 sm:mb-6 group cursor-pointer py-1 -ml-1 px-1 rounded-md touch-manipulation"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Overview</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-tight sm:leading-none">
              Documentation.
            </h1>
            <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug sm:leading-none mt-1 sm:mt-0.5">
              API reference, threat model, and integration guides.
            </p>
          </div>

          <a
            href="https://github.com/gozajpeg/barstile"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors group self-start sm:self-auto touch-manipulation"
          >
            <span>GitHub Repository</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
          </a>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu (Standard Mobile Docs UX) */}
      <div className="md:hidden mt-6 mb-8">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-left touch-manipulation"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-4 h-4 text-zinc-400 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                {activeDoc.category}
              </div>
              <div className="text-sm font-medium text-white truncate">
                {activeDoc.title}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-400 shrink-0 pl-2">
            <span>Sections</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                mobileMenuOpen ? 'rotate-180 text-white' : ''
              }`}
            />
          </div>
        </button>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="mt-2 p-3.5 rounded-xl bg-[#090a0f] border border-white/[0.1] space-y-4 shadow-2xl">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-2.5 py-1">
                  {cat.name}
                </div>
                <div className="space-y-0.5">
                  {cat.items.map((secId) => {
                    const sec = DOC_SECTIONS.find((s) => s.id === secId);
                    if (!sec) return null;
                    const isActive = activeId === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => handleSelectSection(sec.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between cursor-pointer touch-manipulation ${
                          isActive
                            ? 'bg-white text-zinc-950 font-medium'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <span>{sec.title}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-zinc-950" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2-Column Documentation Grid */}
      <div className="py-6 sm:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Left Column: Desktop Categorized Documentation Sidebar */}
        <aside className="hidden md:block md:col-span-4 md:sticky md:top-28 self-start space-y-6">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-medium px-3">
                {cat.name}
              </div>
              <nav className="space-y-0.5">
                {cat.items.map((secId) => {
                  const sec = DOC_SECTIONS.find((s) => s.id === secId);
                  if (!sec) return null;
                  const isActive = activeId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => handleSelectSection(sec.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-white/[0.08] text-white font-medium border border-white/[0.12]'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                      }`}
                    >
                      <span>{sec.title}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </aside>

        {/* Right Column: Active Documentation Section */}
        <main className="md:col-span-8 space-y-6 sm:space-y-8 min-w-0">
          {/* Section Header: Matching 24px Headline + 24px Subtitle */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium mb-1.5">
              {activeDoc.category}
            </div>
            <h2 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
              {activeDoc.title}
            </h2>
            <p className="text-[15px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1">
              {activeDoc.summary}
            </p>
          </div>

          {/* Quickstart Step-by-Step Flow */}
          {activeDoc.steps && (
            <div className="space-y-6 sm:space-y-8 pt-1 sm:pt-2">
              {activeDoc.steps.map((st) => (
                <div key={st.num} className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/[0.08] text-[11px] sm:text-xs font-mono font-medium text-white border border-white/[0.1] shrink-0">
                      {st.num}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-200">
                      {st.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {st.desc}
                  </p>
                  <CodeBlock code={st.code} />
                </div>
              ))}
            </div>
          )}

          {/* Multi-Framework Server Middleware (Express / Fastify / Node.js) */}
          {activeDoc.frameworks && (
            <div className="space-y-4 pt-1 sm:pt-2">
              {activeDoc.desc && (
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  {activeDoc.desc}
                </p>
              )}

              {/* Framework Switcher Tabs */}
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                {activeDoc.frameworks.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setSelectedFramework(fw.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer touch-manipulation ${
                      selectedFramework === fw.id
                        ? 'bg-white text-zinc-950 font-medium shadow-sm'
                        : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    {fw.name}
                  </button>
                ))}
              </div>

              {/* Framework Code Block */}
              <CodeBlock
                code={
                  activeDoc.frameworks.find((f) => f.id === selectedFramework)?.code ||
                  activeDoc.frameworks[0].code
                }
              />

              {activeDoc.capabilities && (
                <div className="pt-3 sm:pt-4 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
                    Core Capabilities
                  </h3>
                  <ul className="space-y-3 text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                    {activeDoc.capabilities.map((cap, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2.5">
                        <span className="text-zinc-600 select-none mt-0.5 sm:mt-1">—</span>
                        <div>
                          <strong className="text-zinc-200 font-medium">{cap.title}:</strong>{' '}
                          {cap.desc}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Standard Single Code Block with Descriptive Capabilities */}
          {activeDoc.code && !activeDoc.steps && !activeDoc.frameworks && (
            <div className="space-y-4 pt-1 sm:pt-2">
              {activeDoc.desc && (
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  {activeDoc.desc}
                </p>
              )}
              <CodeBlock code={activeDoc.code} />

              {activeDoc.capabilities && (
                <div className="pt-3 sm:pt-4 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
                    Core Capabilities
                  </h3>
                  <ul className="space-y-3 text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                    {activeDoc.capabilities.map((cap, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2.5">
                        <span className="text-zinc-600 select-none mt-0.5 sm:mt-1">—</span>
                        <div>
                          <strong className="text-zinc-200 font-medium">{cap.title}:</strong>{' '}
                          {cap.desc}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tables: Difficulty & API Reference */}
          {activeDoc.table && (
            <div className="space-y-4 pt-1 sm:pt-2">
              {activeDoc.desc && (
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  {activeDoc.desc}
                </p>
              )}

              <div className="w-full overflow-x-auto rounded-xl border border-white/[0.08] bg-black/40">
                <table className="w-full min-w-[500px] text-left border-collapse text-xs sm:text-sm">
                  <thead className="bg-white/[0.03] font-mono text-xs uppercase tracking-wider text-zinc-400 border-b border-white/[0.08]">
                    <tr>
                      {activeDoc.table.headers.map((h) => (
                        <th key={h} className="py-3 px-3.5 sm:py-3.5 sm:px-4 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] font-mono text-zinc-300">
                    {activeDoc.table.rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-3 px-3.5 sm:py-3.5 sm:px-4 ${
                              cIdx === 0
                                ? 'font-medium text-white'
                                : cIdx === 3 && cell.includes('ms')
                                ? cell.includes('1,200')
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                                : 'text-zinc-400'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Threat Model Two-Column Comparison */}
          {activeDoc.mitigates && (
            <div className="space-y-4 pt-1 sm:pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-2.5 sm:space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    What Barstile Mitigates
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                    {activeDoc.mitigates.map((item, mIdx) => (
                      <li key={mIdx} className="flex items-start gap-2.5">
                        <span className="text-zinc-600 select-none mt-0.5 sm:mt-1">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0"></span>
                    What Requires Cloud WAF
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                    {activeDoc.requiresWaf.map((item, wIdx) => (
                      <li key={wIdx} className="flex items-start gap-2.5">
                        <span className="text-zinc-600 select-none mt-0.5 sm:mt-1">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section Pagination (Previous / Next) */}
          <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-white/[0.08] flex items-center justify-between gap-3">
            {prevSection ? (
              <button
                onClick={() => handleSelectSection(prevSection.id)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer group py-2 touch-manipulation"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{prevSection.title}</span>
              </button>
            ) : (
              <div />
            )}

            {nextSection && (
              <button
                onClick={() => handleSelectSection(nextSection.id)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-zinc-200 hover:text-white font-medium transition-colors cursor-pointer group py-2 ml-auto touch-manipulation"
              >
                <span className="truncate max-w-[120px] sm:max-w-none">{nextSection.title}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DocsPage;
