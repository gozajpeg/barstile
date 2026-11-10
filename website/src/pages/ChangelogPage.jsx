import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Real Barstile Releases                                                     */
/* -------------------------------------------------------------------------- */
const RELEASES = [
  {
    id: 'release-v1-0-0',
    version: 'v1.0.0',
    date: 'Release',
    title: 'v1.0.0 Release',
    summary:
      'The initial release of the self-hosted, non-interactive bot protection protocol with client-side proof-of-work.',
    highlights: [
      {
        title: 'Non-Interactive PoW Challenge',
        desc: 'Cryptographic challenge tokens solved inside dedicated background Web Workers without visual puzzles or tracking cookies.'
      },
      {
        title: 'Server Middleware',
        desc: 'Native barstileMiddleware intercepting automated traffic before body parsers allocate heap memory on Express, Fastify, Connect, and Node.js http servers.'
      },
      {
        title: 'Drop-in Client Fetch SDK',
        desc: 'Replacement barstileFetch that intercepts HTTP 449 handshakes, executes the challenge off-thread, and retries seamlessly.'
      },
      {
        title: 'Redis Distributed Replay Store',
        desc: 'Atomic nonce verification via RedisReplayStore for horizontal clustering and container fleets.'
      }
    ]
  },
  {
    id: 'release-v0-0-0',
    version: 'v0.0.0',
    date: 'Development',
    title: 'v0.0.0 Development',
    summary:
      'Initial development milestone establishing the core cryptographic engine, challenge-response protocol, and replay caching architecture.',
    highlights: [
      {
        title: 'Core Engine & Cryptography',
        desc: 'SHA-256 target search, HMAC challenge signing, and timestamp validation.'
      },
      {
        title: 'Replay Protection & Tarpit',
        desc: 'In-memory replay cache and adaptive delay mechanisms for repeated failed verifications.'
      },
      {
        title: 'Browser Probes & Fingerprinting',
        desc: 'Automation detection markers and passive client entropy collection.'
      }
    ]
  }
];

/* -------------------------------------------------------------------------- */
/* Precision Timer Digit Roll Component                                       */
/* -------------------------------------------------------------------------- */
function DigitRoll({ digit = '0', height = 52 }) {
  const num = parseInt(digit, 10);
  const safeNum = isNaN(num) ? 0 : num;

  return (
    <span
      className="inline-block overflow-hidden font-sans font-semibold tabular-nums text-white text-[44px]"
      style={{
        height: `${height}px`,
        lineHeight: `${height}px`,
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)'
      }}
    >
      <span
        className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center"
        style={{ transform: `translateY(-${safeNum * height}px)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            className="flex items-center justify-center select-none px-[1px]"
            style={{ height: `${height}px` }}
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

export function ChangelogPage({ onNavigate }) {
  const [activeIdx, setActiveIdx] = useState(0); // 0 is v1.0.0

  const activeRelease = RELEASES[activeIdx] || RELEASES[0];

  // Parse semver digits for timer roll (e.g. "v1.0.0" -> major: ["1"], minor: ["0"], patch: ["0"])
  const cleanVersion = activeRelease.version.replace(/^v/, '');
  const [majStr = '1', minStr = '0', patStr = '0'] = cleanVersion.split('.');
  const majDigits = majStr.split('');
  const minDigits = minStr.split('');
  const patDigits = patStr.split('');

  // Track scroll: updates the sticky version number as the user scrolls between releases
  useEffect(() => {
    const handleScroll = () => {
      const triggerY = Math.min(320, window.innerHeight * 0.45);
      let matched = 0;

      for (let i = 0; i < RELEASES.length; i++) {
        const el = document.getElementById(RELEASES[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY) {
            matched = i;
          }
        }
      }

      setActiveIdx(matched);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="pt-28 pb-24 px-6 max-w-5xl mx-auto select-none">
      {/* Editorial Header */}
      <div className="pb-12 border-b border-white/[0.08]">
        <button
          onClick={() => {
            onNavigate('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Overview</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-white leading-none">
              Changelog.
            </h1>
            <p className="text-[24px] text-zinc-500 font-normal tracking-tight leading-none mt-0.5">
              Releases, architecture updates, and protocol refinements.
            </p>
          </div>

          <a
            href="https://github.com/gozajpeg/barstile/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors group self-start sm:self-auto"
          >
            <span>GitHub Releases</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
          </a>
        </div>
      </div>

      {/* 2-Column Release Section */}
      <div className="py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Left Column: Sticky Version Display with Timer Transition (44px, matching site font) */}
        <aside className="md:col-span-4 md:sticky md:top-28 self-start space-y-3">
          <div className="flex items-center font-sans font-semibold tracking-tight text-white leading-none">
            <span className="text-zinc-500 text-[32px] font-sans font-medium select-none mr-0.5">v</span>
            {majDigits.map((d, i) => (
              <DigitRoll key={`maj-${i}`} digit={d} height={52} />
            ))}
            <span className="text-zinc-500 text-[32px] font-sans font-medium select-none px-0.5">.</span>
            {minDigits.map((d, i) => (
              <DigitRoll key={`min-${i}`} digit={d} height={52} />
            ))}
            <span className="text-zinc-500 text-[32px] font-sans font-medium select-none px-0.5">.</span>
            {patDigits.map((d, i) => (
              <DigitRoll key={`pat-${i}`} digit={d} height={52} />
            ))}
          </div>

          <div className="text-sm text-zinc-500 font-sans transition-opacity duration-300">
            {activeRelease.date}
          </div>
        </aside>

        {/* Right Column: Release Details */}
        <div className="md:col-span-8 divide-y divide-white/[0.08]">
          {RELEASES.map((rel, idx) => (
            <article
              key={rel.id}
              id={rel.id}
              className={`py-14 sm:py-18 space-y-6 scroll-mt-28 ${
                idx === 0 ? 'first:pt-0' : ''
              } ${idx === RELEASES.length - 1 ? 'pb-12 sm:pb-16' : ''}`}
            >
              <div>
                <h2 className="text-[24px] font-semibold tracking-tight text-white leading-snug">
                  {rel.title}
                </h2>
                <p className="text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1">
                  {rel.summary}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
                  Core Capabilities
                </h3>

                <ul className="space-y-3.5 text-sm text-zinc-400 leading-relaxed font-normal">
                  {rel.highlights.map((item, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2.5">
                      <span className="text-zinc-600 select-none mt-1">—</span>
                      <div>
                        <strong className="text-zinc-200 font-medium">{item.title}:</strong>{' '}
                        {item.desc}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChangelogPage;
