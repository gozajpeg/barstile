import React from 'react';
import { ArrowRight, Github } from 'lucide-react';
import { HeroArc } from './HeroArc.jsx';
import { RuntimeLogos } from './RuntimeLogos.jsx';

export function Hero({ onNavigate }) {
  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 text-center select-none overflow-hidden"
    >
      {/* Architectural Framing Arc with Animated Wrapping Beam */}
      <HeroArc />

      {/* Main Content Centered in Full Viewport */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="relative max-w-2xl mx-auto">
          {/* Logo Eyes: Absolutely anchored above heading with zero flow displacement */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-7 sm:mb-9 pointer-events-none flex items-center justify-center">
            <div className="animate-eye-wake">
              <svg
                viewBox="0 0 100 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[76px] h-[61px] sm:w-[94px] sm:h-[75px] md:w-[108px] md:h-[86px] text-white"
                role="img"
                aria-label="Barstile Logo"
              >
                {/* Left eye capsule */}
                <rect
                  x="12"
                  y="10"
                  width="33"
                  height="60"
                  rx="16.5"
                  fill="currentColor"
                  className="animate-eye-blink"
                />
                {/* Right eye capsule */}
                <rect
                  x="55"
                  y="10"
                  width="33"
                  height="60"
                  rx="16.5"
                  fill="currentColor"
                  className="animate-eye-blink"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-[48px] font-semibold tracking-[-0.03em] text-white leading-[1.15]">
            <span
              className="inline-block animate-word-blurred"
              style={{ '--slide-delay': '100ms' }}
            >
              Self-hosted
            </span>{' '}
            <span
              className="inline-block animate-word-blurred"
              style={{ '--slide-delay': '300ms' }}
            >
              non-interactive
            </span>{' '}
            <span
              className="inline-block animate-word-blurred"
              style={{ '--slide-delay': '500ms' }}
            >
              bot protection
            </span>
          </h1>
        </div>

        {/* Action Controls in a 2-Column Grid */}
        <div
          className="grid grid-cols-2 gap-3 max-w-[360px] mx-auto mt-10 animate-ease-in-up"
          style={{ animationDelay: '1100ms' }}
        >
          <button
            onClick={() => onNavigate('docs')}
            className="w-full h-10 flex items-center justify-center gap-1.5 px-3 rounded-full bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-all active:scale-95 shadow-lg group whitespace-nowrap cursor-pointer"
          >
            <span>Quickstart</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* GitHub Button: Solid (not see-through) with animated moving outline line */}
          <a
            href="https://github.com/gozajpeg/barstile"
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-full h-10 inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden active:scale-95 transition-all shadow-sm group"
          >
            {/* Base subtle border line */}
            <span className="absolute inset-0 rounded-full border border-white/[0.12]" />

            {/* Moving line at the outline (Option 4: Prism Titanium) */}
            <span
              className="absolute inset-[-150%] animate-border-beam pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg 260deg, rgba(148, 163, 184, 0.15) 290deg, #94a3b8 320deg, #e2e8f0 345deg, #ffffff 355deg, transparent 360deg)'
              }}
            />

            {/* Solid interior (not see-through) */}
            <span className="relative z-10 w-full h-full flex items-center justify-center gap-1.5 px-3 rounded-full bg-[#0d0f14] group-hover:bg-[#141720] text-xs font-medium text-zinc-300 group-hover:text-white transition-all whitespace-nowrap">
              <Github className="w-3.5 h-3.5 text-white" />
              <span>GitHub</span>
            </span>
          </a>
        </div>
      </div>

      {/* Lower Architectural Area: Grounded Subheading & Ecosystem Runtimes */}
      <div
        className="absolute bottom-[6%] sm:bottom-[7%] md:bottom-[8%] inset-x-0 z-10 px-6 max-w-4xl mx-auto flex flex-col items-center animate-ease-in-up"
        style={{ animationDelay: '1350ms' }}
      >
        {/* Subheading */}
        <div className="text-center mb-6 sm:mb-7 pointer-events-none max-w-2xl mx-auto">
          <p className="text-[18px] sm:text-[22px] text-zinc-400 font-normal tracking-tight leading-snug">
            Protects endpoints and forms from automated bots{' '}
            <br className="hidden sm:inline" />
            without visual puzzles, third-party trackers, or user interruptions.
          </p>
        </div>

        {/* Logos: Ecosystem runtimes & frameworks that run Barstile */}
        <div className="pointer-events-auto">
          <RuntimeLogos />
        </div>
      </div>
    </section>
  );
}

export default Hero;