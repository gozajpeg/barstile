import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Copy, Check, ChevronRight, ChevronLeft, ChevronDown, BookOpen } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Documentation Hierarchy and Categories                                     */
/* -------------------------------------------------------------------------- */
const CATEGORIES = [
  {
    name: 'Getting Started',
    items: ['quickstart', 'concepts']
  },
  {
    name: 'Integration',
    items: ['server', 'client', 'react', 'webcomponent']
  },
  {
    name: 'Core Guides',
    items: ['difficulty', 'cluster']
  },
  {
    name: 'Reference and Security',
    items: ['api', 'security']
  }
];

const DOC_SECTIONS = [
  {
    id: 'quickstart',
    category: 'Getting Started',
    title: 'Quickstart Guide',
    summary: 'Protect your website and API from bots in less than five minutes.',
    steps: [
      {
        num: '1',
        title: 'Install the package',
        desc: 'Add Barstile to your project using npm or your favorite package manager.',
        code: 'npm install barstile'
      },
      {
        num: '2',
        title: 'Add server middleware (Express or Node.js)',
        desc: 'Mount Barstile before your route handlers. It asks unknown visitors to solve a fast math puzzle and lets verified users through.',
        code: `import express from 'express';
import { barstileMiddleware } from 'barstile/server';

const app = express();

// Protect your routes with difficulty 3 (fast for humans, expensive for bots)
app.use(barstileMiddleware({ difficulty: 3 }));

// Normal route handlers run only after the proof is verified
app.post('/api/contact', express.json(), (req, res) => {
  res.json({ message: 'Message received safely' });
});

app.listen(3000);`
      },
      {
        num: '3',
        title: 'Protect your frontend (Forms or Fetch API)',
        desc: 'For HTML forms, drop in the widget. For API calls, replace native fetch with barstileFetch.',
        code: `// Option A: For REST API calls (React, Vue, SPA)
import { barstileFetch } from 'barstile/client';

const res = await barstileFetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello' })
});

// Option B: For HTML forms, add this container:
// <div class="barstile-widget"></div>
// And call autoInitializeWidgets() in your script.`
      }
    ]
  },
  {
    id: 'concepts',
    category: 'Getting Started',
    title: 'How Barstile Works',
    summary: 'A simple look at background Proof-of-Work defense.',
    desc: 'Instead of making users click pictures of traffic lights, Barstile uses computer math in the background. Real people never notice it, but bots trying to spam thousands of requests quickly run out of processing power.',
    steps: [
      {
        num: '1',
        title: 'The visitor sends a request',
        desc: 'A user opens your web page or submits an API call.',
        code: `// 1. Client calls protected route
fetch('/api/submit', { method: 'POST' });`
      },
      {
        num: '2',
        title: 'Server issues a fast challenge',
        desc: 'If the visitor does not have a valid clearance pass, the server sends back an HTTP 449 status with a tiny math puzzle (SHA-256).',
        code: `// HTTP/1.1 449 Retry With
// x-barstile-challenge: "salt.3.1700000000.signature"`
      },
      {
        num: '3',
        title: 'Browser solves in the background',
        desc: 'The browser runs the math search inside a background Web Worker. Your screen does not freeze, and animations stay smooth.',
        code: `// Solved in background thread in 10 to 30 milliseconds
// Nonce found: 4218`
      },
      {
        num: '4',
        title: 'Server grants a 15-minute VIP pass',
        desc: 'The server verifies the answer in 0.05 milliseconds. It hands the browser a 15-minute clearance cookie so the user can browse without solving again.',
        code: `// Subsequent requests pass instantly with 200 OK
// req.barstile = { verified: true, clearance: true };`
      }
    ]
  },
  {
    id: 'server',
    category: 'Integration',
    title: 'Server Middleware',
    summary: 'Simple request protection for Express, Fastify, and Node.js.',
    desc: 'barstileMiddleware runs before your route handlers. It checks proof before your server spends memory reading large request bodies.',
    frameworks: [
      {
        id: 'express',
        name: 'Express',
        code: `import express from 'express';
import { barstileMiddleware } from 'barstile/server';

const app = express();

// 1. Mount Barstile before body parsers to save server memory
app.use(barstileMiddleware({
  difficulty: 3,
  ttlMs: 60000,
  routes: {
    '/public/*': 1,                                       // Fast browsing (1 to 2 ms)
    'POST /api/login': 5,                                 // High security for login
    'POST /checkout': { difficulty: 4, clearance: false } // Fresh solve per purchase
  },
  // Optional rate limiting for abusive IP addresses
  tarpit: { maxRequests: 60, windowMs: 60000 }
}));

// 2. Body parsers run only for verified human visitors
app.use(express.json());

app.post('/api/login', (req, res) => {
  // Access solve details
  const { verified, difficulty } = req.barstile;
  res.json({ success: true, verified });
});

app.listen(3000);`
      },
      {
        id: 'fastify',
        name: 'Fastify',
        code: `import Fastify from 'fastify';
import { barstileMiddleware } from 'barstile/server';

const fastify = Fastify({ logger: true });
const guard = barstileMiddleware({ difficulty: 3 });

// 1. Run Barstile in the onRequest hook before body parsing
fastify.addHook('onRequest', (request, reply, done) => {
  guard(request.raw, reply.raw, done);
});

// 2. Protected route
fastify.post('/api/login', async (request, reply) => {
  const barstile = request.raw.barstile || {};
  return { success: true, verified: barstile.verified };
});

await fastify.listen({ port: 3000 });`
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

server.listen(3000);`
      }
    ],
    capabilities: [
      {
        title: 'Saves server memory',
        desc: 'Rejects fake requests and bots before body parsers read payload bytes into RAM.'
      },
      {
        title: 'Custom route difficulty',
        desc: 'Set light difficulty (1 or 2) for read pages, and higher difficulty (4 or 5) for logins.'
      },
      {
        title: 'Built-in rate limiter',
        desc: 'The tarpit option automatically slows down and temporarily blocks IP addresses that flood failed requests.'
      },
      {
        title: 'Automatic secure cookies',
        desc: 'Clearance cookies automatically get the Secure attribute when your site runs on HTTPS.'
      }
    ]
  },
  {
    id: 'client',
    category: 'Integration',
    title: 'Client Fetch and HTML Forms',
    summary: 'Protect API calls and forms without tracking cookies or puzzles.',
    desc: 'You can protect web forms using a simple HTML container or protect API calls using barstileFetch.',
    code: `<!-- 1. HTML Form with invisible verification -->
<form action="/login" method="POST">
  <input type="text" name="username" required />
  <input type="password" name="password" required />

  <!-- Mounts the self-hosted verification box -->
  <div class="barstile-widget"></div>

  <button type="submit">Sign in</button>
</form>

<script type="module">
  import { autoInitializeWidgets } from 'barstile/client';
  
  // Initializes all widgets on the page
  autoInitializeWidgets();
</script>`,
    capabilities: [
      {
        title: 'Invisible by default',
        desc: 'Requires zero clicks from users. It stays idle on page load and solves in the background when the user submits.'
      },
      {
        title: 'Web Worker background solve',
        desc: 'Math calculations run in a background thread so the user interface never stutters.'
      },
      {
        title: 'Automatic retry with barstileFetch',
        desc: 'Catches HTTP 449 challenge responses, solves the puzzle, and retries the request automatically.'
      },
      {
        title: 'Multiple forms share clearance',
        desc: 'If you have multiple forms on the same page, solving one form unlocks the other forms instantly.'
      }
    ]
  },
  {
    id: 'react',
    category: 'Integration',
    title: 'React Component',
    summary: 'Ready to use component for React, Next.js, and Remix.',
    desc: 'The BarstileWidget component is safe for server-side rendering and works in Next.js App Router, Pages Router, and standard React apps.',
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
        'x-barstile-solution': token
      },
      body: JSON.stringify({ email: e.target.email.value })
    });
    const data = await res.json();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" required />

      {/* Invisible mode is default. Use mode="interactive" for a visible box */}
      <BarstileWidget
        mode="invisible"
        onSuccess={(solvedToken) => setToken(solvedToken)}
      />

      <button type="submit">
        Log in
      </button>
    </form>
  );
}`,
    capabilities: [
      {
        title: 'Zero clicks needed',
        desc: 'Invisible mode runs silently in the background when the form is submitted.'
      },
      {
        title: 'Optional interactive mode',
        desc: 'Set mode="interactive" if you want a visible checkbox like Cloudflare Turnstile.'
      },
      {
        title: 'Server-side rendering safe',
        desc: 'Does not throw errors during SSR or static site generation in Next.js or Remix.'
      }
    ]
  },
  {
    id: 'webcomponent',
    category: 'Integration',
    title: 'Web Component',
    summary: 'Works with Vue, Svelte, Angular, Astro, or plain HTML.',
    desc: 'If you are not using React, import the custom element. It works anywhere in any web framework or CMS.',
    code: `<!-- 1. In your HTML or framework template -->
<form id="contact-form" action="/contact" method="POST">
  <input type="text" name="name" required />

  <!-- Barstile Custom Element -->
  <barstile-widget data-mode="invisible"></barstile-widget>

  <button type="submit">Send</button>
</form>

<!-- 2. Import the Web Component registration script -->
<script type="module">
  import 'barstile/web-component';
</script>`,
    capabilities: [
      {
        title: 'Framework agnostic',
        desc: 'Works natively in Vue, Svelte, Angular, Astro, Solid, or plain static HTML pages.'
      },
      {
        title: 'Lightweight',
        desc: 'Uses native browser Custom Elements with zero runtime dependencies.'
      }
    ]
  },
  {
    id: 'difficulty',
    category: 'Core Guides',
    title: 'Difficulty Tuning',
    summary: 'Make attacks expensive for bots while keeping human visits fast.',
    desc: 'Barstile uses SHA-256 target search. Each step in difficulty requires roughly 16 times more math work. Choose the right level for your needs.',
    table: {
      headers: ['Difficulty', 'Hex Prefix', 'Average Hashes', 'Typical Human Solve Time'],
      rows: [
        ['1', '0...', '16', 'Less than 2 ms'],
        ['2', '00...', '256', 'Less than 5 ms'],
        ['3 (Recommended for Web)', '000...', '4,096', '5 to 25 ms'],
        ['4 (Default)', '0000...', '65,536', '50 to 250 ms'],
        ['5 (Heavy Defense)', '00000...', '1,048,576', '1 to 3 seconds']
      ]
    },
    capabilities: [
      {
        title: 'Adaptive bot escalation',
        desc: 'If Barstile detects that a visitor is running headless tools like Puppeteer, it automatically raises difficulty so scrapers burn CPU, while human visitors stay on fast mode.'
      },
      {
        title: 'Mobile safe limit',
        desc: 'Automatic escalation is capped at difficulty 5 so budget mobile phones never freeze.'
      }
    ]
  },
  {
    id: 'cluster',
    category: 'Core Guides',
    title: 'Multi-Server Clusters and Redis',
    summary: 'Share solved tokens across Kubernetes fleets and server clusters.',
    desc: 'A single server works out of the box in memory with zero setup. If you run multiple servers behind a load balancer, connect Redis so all servers recognize the same solved tokens and rate limits.',
    code: `import express from 'express';
import Redis from 'ioredis';
import { barstileMiddleware } from 'barstile/server';

const app = express();
const redis = new Redis(process.env.REDIS_URL);

app.use(barstileMiddleware({
  // Mandatory: shared secret key so all pods verify the same tokens
  secret: process.env.BARSTILE_SECRET,
  // Connect Redis for atomic distributed replay protection
  redis
}));`,
    capabilities: [
      {
        title: 'Atomic Redis checks',
        desc: 'Uses atomic Redis commands so bots cannot replay the same solved token across different servers.'
      },
      {
        title: 'Graceful fallback',
        desc: 'If Redis is temporarily unreachable, Barstile safely falls back to local memory so your site stays up.'
      }
    ]
  },
  {
    id: 'api',
    category: 'Reference and Security',
    title: 'API Options Reference',
    summary: 'Full list of settings for barstileMiddleware().',
    desc: 'All configuration options can be passed to barstileMiddleware({ ... }) when setting up your server.',
    table: {
      headers: ['Option', 'Type', 'Default', 'Description'],
      rows: [
        ['difficulty', 'number', '4', 'Math difficulty level (1 to 5). We recommend 3 for web forms.'],
        ['ttlMs', 'number', '60000', 'How long a puzzle stays valid in milliseconds (60 seconds).'],
        ['secret', 'string', 'auto-generated', 'HMAC secret key. Set this in multi-server setups so all pods share tokens.'],
        ['clearance', 'boolean', 'true', 'Gives verified users a VIP pass so they do not have to solve on every click.'],
        ['clearanceTtlMs', 'number', '900000', 'How long the VIP pass lasts in milliseconds (15 minutes).'],
        ['clearanceQuota', 'number', '100', 'Maximum requests allowed per VIP pass before asking for a fresh solve.'],
        ['routes', 'object', 'undefined', 'Custom difficulty and clearance rules for specific routes.'],
        ['secure', 'boolean', 'auto', 'Adds the Secure flag to cookies (auto-detects HTTPS by default).'],
        ['tarpit', 'object', 'undefined', 'Rate limiter that slows down and temporarily blocks abusive IP addresses.'],
        ['maxPreChallengeBodyBytes', 'number', '65536', 'Drops unverified requests over 64KB before reading into memory.'],
        ['blockBots', "boolean | 'escalate'", 'false', "Rejects automated tools when true, or escalates difficulty when 'escalate'."],
        ['adaptiveRisk', 'boolean', 'false', 'Automatically escalates puzzle difficulty when probe anomalies are detected.'],
        ['redis', 'any', 'undefined', 'Redis client instance for sharing solved tokens across multiple servers.']
      ]
    }
  },
  {
    id: 'security',
    category: 'Reference and Security',
    title: 'What Barstile Stops',
    summary: 'Clear boundaries of what Barstile defends against and what requires a cloud WAF.',
    desc: 'Barstile is an application-layer defense system. It stops automated bot traffic and resource abuse on your Node.js servers. Review the separated guides below to see what Barstile handles and when you still need edge network protection.',
    mitigates: [
      {
        title: 'High-speed scrapers and automated crawlers',
        desc: 'Stops automated scraping tools from downloading your data or scraping hundreds of pages per minute. Because every challenge requires real computational proof, mass scraping quickly burns out an attacker CPU power and cloud budget.'
      },
      {
        title: 'Credential stuffing and brute-force login bots',
        desc: 'Protects user accounts from automated password guessing attacks. By requiring proof on POST /api/login, botnets trying thousands of leaked username and password combinations are drastically slowed down to a crawl.'
      },
      {
        title: 'Form spam and fake signups',
        desc: 'Blocks automated bots from submitting contact forms, fake registrations, and newsletter spam. Real human visitors submit without interruption, while automated scripts fail the background verification.'
      },
      {
        title: 'Memory exhaustion and Slowloris uploads',
        desc: 'Defends your Node.js server against large unverified request bodies. If an unverified client tries to upload more than 64KB before solving proof-of-work, Barstile terminates the TCP socket immediately before memory is allocated.'
      },
      {
        title: 'Replay attacks and token theft',
        desc: 'Guarantees that each solved puzzle can only be used once. Solved nonces are recorded in memory or synchronized across Redis clusters, blocking attackers from capturing and replaying valid tokens.'
      }
    ],
    requiresWaf: [
      {
        title: 'Gigantic volumetric network floods (Layer 3 and 4)',
        desc: 'Bandwidth attacks (like multi-gigabit UDP or SYN floods) saturate your host network interface before traffic even reaches your Node.js process. You still need an edge CDN or cloud scrubbing provider (such as Cloudflare, AWS Shield, or Fastly) to protect the network pipe.'
      },
      {
        title: 'Manual human click farms',
        desc: 'Proof-of-work verifies that computational effort was spent. It does not stop real humans who are paid to sit in front of screens and manually fill out and submit forms by hand.'
      },
      {
        title: 'Slow, low-frequency scrapers',
        desc: 'A custom bot that makes only one request every two minutes behaves identically to a real human casually reading a website. For low-frequency access, rely on application authorization, API keys, or database rate limits.'
      }
    ]
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

      {/* Mobile Navigation Dropdown Menu */}
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
          {/* Section Header */}
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

          {/* Quickstart and Concepts Step-by-Step Flow */}
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
                        <span className="text-zinc-500 select-none mt-0.5 sm:mt-1 text-xs">•</span>
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
                        <span className="text-zinc-500 select-none mt-0.5 sm:mt-1 text-xs">•</span>
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

          {/* Tables: Difficulty and API Reference */}
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
                                ? 'text-emerald-400'
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

              {activeDoc.capabilities && (
                <div className="pt-3 sm:pt-4 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
                    Key Features
                  </h3>
                  <ul className="space-y-3 text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                    {activeDoc.capabilities.map((cap, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2.5">
                        <span className="text-zinc-500 select-none mt-0.5 sm:mt-1 text-xs">•</span>
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

          {/* Threat Model Single-Column Separated Panels */}
          {activeDoc.mitigates && (
            <div className="space-y-6 sm:space-y-8 pt-1 sm:pt-2">
              {activeDoc.desc && (
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  {activeDoc.desc}
                </p>
              )}

              {/* Panel 1: What Barstile Stops */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                    What Barstile Stops
                  </h3>
                </div>
                <ul className="space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  {activeDoc.mitigates.map((item, mIdx) => (
                    <li key={mIdx} className="flex items-start gap-3">
                      <span className="text-zinc-500 select-none mt-0.5 sm:mt-1 text-xs">•</span>
                      <div>
                        <strong className="text-zinc-200 font-medium">{item.title}:</strong>{' '}
                        {item.desc}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Panel 2: What Still Needs Cloud WAF */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                  <span className="w-2 h-2 rounded-full bg-zinc-500 shrink-0"></span>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    What Still Needs Cloud WAF
                  </h3>
                </div>
                <ul className="space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  {activeDoc.requiresWaf.map((item, wIdx) => (
                    <li key={wIdx} className="flex items-start gap-3">
                      <span className="text-zinc-500 select-none mt-0.5 sm:mt-1 text-xs">•</span>
                      <div>
                        <strong className="text-zinc-200 font-medium">{item.title}:</strong>{' '}
                        {item.desc}
                      </div>
                    </li>
                  ))}
                </ul>
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
