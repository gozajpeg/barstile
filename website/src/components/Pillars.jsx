import React from 'react';

/* -------------------------------------------------------------------------- */
/* SVG Animation 1: Zero Third Parties (Isolated Local Server Boundary)       */
/* -------------------------------------------------------------------------- */
function ThirdPartiesGraphic() {
  return (
    <div className="relative w-full h-[190px] sm:h-[210px] flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 380 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[340px] h-full"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id="localPipeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="cloudCutGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#71717a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Local Boundary Container */}
        <rect
          x="30"
          y="25"
          width="210"
          height="130"
          rx="12"
          fill="#0b0d13"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.2"
        />
        <text
          x="44"
          y="48"
          fill="#71717a"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="0.05em"
        >
          LOCAL SERVER PROCESS
        </text>

        {/* Incoming Client Packet Trace */}
        <path
          d="M 10 90 L 50 90"
          stroke="rgba(56, 189, 248, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <circle cx="28" cy="90" r="3" fill="#38bdf8">
          <animate
            attributeName="cx"
            values="10;50;10"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Local Node / HMAC Engine Box */}
        <rect
          x="60"
          y="65"
          width="150"
          height="50"
          rx="8"
          fill="#131722"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />
        <text
          x="80"
          y="88"
          fill="#f4f4f5"
          fontSize="11"
          fontWeight="600"
          fontFamily="monospace"
        >
          In-Memory HMAC
        </text>
        <text
          x="80"
          y="102"
          fill="#34d399"
          fontSize="9.5"
          fontFamily="monospace"
        >
          ● 0.04ms local verify
        </text>

        {/* Outbound Cut Trace (Blocked 3rd party line) */}
        <path
          d="M 240 90 L 295 90"
          stroke="url(#cloudCutGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {/* Severed / Denied indicator */}
        <circle cx="270" cy="90" r="8" fill="#18181b" stroke="#ef4444" strokeWidth="1.2" />
        <line x1="265" y1="85" x2="275" y2="95" stroke="#ef4444" strokeWidth="1.5" />
        <line x1="275" y1="85" x2="265" y2="95" stroke="#ef4444" strokeWidth="1.5" />

        {/* Remote 3rd-Party Cloud (Disconnected) */}
        <g opacity="0.35">
          <rect
            x="305"
            y="65"
            width="65"
            height="50"
            rx="8"
            fill="#090a0f"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
          />
          <text
            x="315"
            y="87"
            fill="#a1a1aa"
            fontSize="9"
            fontFamily="monospace"
          >
            US CDN
          </text>
          <text
            x="315"
            y="101"
            fill="#ef4444"
            fontSize="8"
            fontFamily="monospace"
          >
            0 calls
          </text>
        </g>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SVG Animation 2: Zero Cookies (Transient Memory Ring)                      */
/* -------------------------------------------------------------------------- */
function CookiesGraphic() {
  return (
    <div className="relative w-full h-[190px] sm:h-[210px] flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 240 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[220px] h-full"
        shapeRendering="geometricPrecision"
      >
        {/* Outer Orbit Ring */}
        <circle
          cx="120"
          cy="85"
          r="54"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Active Animated Progress Arc */}
        <circle
          cx="120"
          cy="85"
          r="54"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="60 280"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 120 85"
            to="360 120 85"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Center Key / Shield Node */}
        <circle
          cx="120"
          cy="85"
          r="34"
          fill="#0e111a"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1.2"
        />
        <text
          x="120"
          y="83"
          textAnchor="middle"
          fill="#f4f4f5"
          fontSize="10"
          fontWeight="700"
          fontFamily="monospace"
        >
          0.00
        </text>
        <text
          x="120"
          y="95"
          textAnchor="middle"
          fill="#71717a"
          fontSize="8"
          fontFamily="monospace"
        >
          COOKIES
        </text>

        {/* Bottom Status Tag */}
        <rect
          x="60"
          y="148"
          width="120"
          height="22"
          rx="4"
          fill="#11131a"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
        />
        <text
          x="120"
          y="162"
          textAnchor="middle"
          fill="#34d399"
          fontSize="9"
          fontFamily="monospace"
        >
          100% RAM Stateless
        </text>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SVG Animation 3: Zero Telemetry (Privacy Radar Pulse)                      */
/* -------------------------------------------------------------------------- */
function TelemetryGraphic() {
  return (
    <div className="relative w-full h-[190px] sm:h-[210px] flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 240 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[220px] h-full"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id="radarSweepGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Radar Rings */}
        <circle cx="120" cy="85" r="22" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
        <circle cx="120" cy="85" r="44" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
        <circle cx="120" cy="85" r="62" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />

        {/* Crosshairs */}
        <line x1="58" y1="85" x2="182" y2="85" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
        <line x1="120" y1="23" x2="120" y2="147" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />

        {/* Rotating Radar Sweep Beam */}
        <g>
          <path
            d="M 120 85 L 175 50 A 62 62 0 0 0 120 23 Z"
            fill="url(#radarSweepGrad)"
          />
          <line x1="120" y1="85" x2="175" y2="50" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.8" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 120 85"
            to="360 120 85"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </g>

        {/* Center Target Dot */}
        <circle cx="120" cy="85" r="3.5" fill="#38bdf8" />

        {/* Bottom Status Tag */}
        <rect
          x="55"
          y="152"
          width="130"
          height="20"
          rx="4"
          fill="#11131a"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
        />
        <text
          x="120"
          y="165"
          textAnchor="middle"
          fill="#a1a1aa"
          fontSize="9"
          fontFamily="monospace"
        >
          No IP Profiling
        </text>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SVG Animation 4: 15 JS/TS Frameworks (Synchronized Runtime Mesh)           */
/* -------------------------------------------------------------------------- */
function FrameworksGraphic() {
  const nodes = [
    { name: 'NEXT', x: 60, y: 55 },
    { name: 'BUN', x: 125, y: 40 },
    { name: 'DENO', x: 255, y: 40 },
    { name: 'HONO', x: 320, y: 55 },
    { name: 'EXPR', x: 75, y: 135 },
    { name: 'FAST', x: 305, y: 135 },
  ];

  return (
    <div className="relative w-full h-[190px] sm:h-[210px] flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 380 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[340px] h-full"
        shapeRendering="geometricPrecision"
      >
        {/* Connection Traces to Central Engine */}
        {nodes.map((node, i) => (
          <g key={i}>
            <line
              x1="190"
              y1="95"
              x2={node.x}
              y2={node.y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
            {/* Pulsing Signal Dot Along Line */}
            <circle r="2.5" fill="#38bdf8">
              <animate
                attributeName="cx"
                values={`190;${node.x};190`}
                dur={`${2.2 + i * 0.3}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`95;${node.y};95`}
                dur={`${2.2 + i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* Central Barstile Kernel Node */}
        <circle cx="190" cy="95" r="26" fill="#0f121b" stroke="#38bdf8" strokeWidth="1.5" />
        <text
          x="190"
          y="93"
          textAnchor="middle"
          fill="#f4f4f5"
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="monospace"
        >
          BARSTILE
        </text>
        <text
          x="190"
          y="105"
          textAnchor="middle"
          fill="#38bdf8"
          fontSize="8"
          fontFamily="monospace"
        >
          CORE
        </text>

        {/* Satellite Framework Chips */}
        {nodes.map((node, i) => (
          <g key={i}>
            <rect
              x={node.x - 22}
              y={node.y - 12}
              width="44"
              height="24"
              rx="5"
              fill="#0a0c12"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
            />
            <text
              x={node.x}
              y={node.y + 4}
              textAnchor="middle"
              fill="#d4d4d8"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="600"
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Pillars Section Component (Bento Grid, 100vh / min-h-screen)          */
/* -------------------------------------------------------------------------- */
export function Pillars() {
  return (
    <section
      id="pillars"
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 sm:px-12 py-24 select-none content-lazy"
    >
      <div className="max-w-7xl w-full mx-auto">
        {/* Section Top Heading: Standard Barstile Site-Wide Typography */}
        <div className="mb-14 sm:mb-16 text-center">
          <h2 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-none">
            Privacy isn't a feature. It's the architecture.
          </h2>
          <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-none mt-1 sm:mt-0.5">
            Zero cookies, zero external dependencies, zero user profiling.
          </p>
        </div>

        {/* Asymmetrical Bento Grid matching Section 2 container styling */}
        <div className="border-t border-b border-white/[0.08] divide-y divide-white/[0.08]">
          {/* Row 1: Wide Card (7 cols) + Compact Card (5 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {/* Card 1: Zero Third Parties (Wide: 7 cols) */}
            <div className="md:col-span-7 flex flex-col p-6 sm:p-8 lg:p-10 justify-between h-full">
              <ThirdPartiesGraphic />
              <div className="text-left w-full mt-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                    Zero Third Parties
                  </h3>
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    100% In-Process
                  </span>
                </div>
                <p className="text-[15px] sm:text-[16px] text-zinc-400 font-normal leading-relaxed">
                  Runs directly inside your server memory. Zero outbound HTTPS calls to Cloudflare, Google, or AWS. If your server is online, Barstile works offline.
                </p>
              </div>
            </div>

            {/* Card 2: Zero Cookies (Compact: 5 cols) */}
            <div className="md:col-span-5 flex flex-col p-6 sm:p-8 lg:p-10 justify-between h-full">
              <CookiesGraphic />
              <div className="text-left w-full mt-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                    Zero Cookies
                  </h3>
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Stateless
                  </span>
                </div>
                <p className="text-[15px] sm:text-[16px] text-zinc-400 font-normal leading-relaxed">
                  No tracking cookies, no localStorage residue, and no persistent identifiers. 100% GDPR & ePrivacy compliant out of the box with zero cookie banners.
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Compact Card (5 cols) + Wide Card (7 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {/* Card 3: Zero Telemetry (Compact: 5 cols) */}
            <div className="md:col-span-5 flex flex-col p-6 sm:p-8 lg:p-10 justify-between h-full">
              <TelemetryGraphic />
              <div className="text-left w-full mt-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                    Zero Analytics
                  </h3>
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-300 border border-zinc-500/20">
                    No Profiling
                  </span>
                </div>
                <p className="text-[15px] sm:text-[16px] text-zinc-400 font-normal leading-relaxed">
                  We don't collect IP graphs, browser fingerprints, or user behavior to monetize threat networks. Just pure, uncompromised cryptographic proof-of-work.
                </p>
              </div>
            </div>

            {/* Card 4: 15 Frameworks (Wide: 7 cols) */}
            <div className="md:col-span-7 flex flex-col p-6 sm:p-8 lg:p-10 justify-between h-full">
              <FrameworksGraphic />
              <div className="text-left w-full mt-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                    15 Native Frameworks
                  </h3>
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    JS / TS Native
                  </span>
                </div>
                <p className="text-[15px] sm:text-[16px] text-zinc-400 font-normal leading-relaxed">
                  Drop-in middleware and client adapters for Next.js, Express, Fastify, Hono, Bun, Deno, Koa, and SvelteKit—with first-party types and zero build steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pillars;
