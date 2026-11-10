import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BarstileLogo } from './BarstileLogo.jsx';

export function Footer({ onNavigate }) {
  const handleNav = (view) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 bg-transparent px-6 py-10 sm:py-14 text-xs select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
        {/* Brand & Hero Subtext */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex items-center gap-3">
            <BarstileLogo className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white shrink-0" />
            <h2 className="text-3xl sm:text-4xl md:text-[48px] font-semibold tracking-[-0.03em] text-white leading-[1.15]">
              Barstile
            </h2>
          </div>
          <p className="text-[18px] sm:text-[22px] text-zinc-400 font-normal tracking-tight leading-snug mt-2 max-w-xl">
            Self-hosted non-interactive bot protection
          </p>
        </div>

        {/* Unified Clickables on the Side (Zero separator line, MIT License alongside links) */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 sm:gap-6 text-xs text-zinc-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
          <button
            onClick={() => handleNav('docs')}
            className="hover:text-white font-medium transition-colors cursor-pointer"
          >
            Documentation
          </button>
          <button
            onClick={() => handleNav('changelog')}
            className="hover:text-white font-medium transition-colors cursor-pointer"
          >
            Changelog
          </button>
          <button
            onClick={() => handleNav('privacy')}
            className="hover:text-white font-medium transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <a
            href="https://github.com/gozajpeg/barstile"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 hover:text-white font-medium transition-colors"
            aria-label="Barstile on GitHub"
          >
            <span>GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </a>
          <a
            href="https://www.npmjs.com/package/barstile"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 hover:text-white font-medium transition-colors"
            aria-label="Barstile on npm"
          >
            <span>npm</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </a>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <a
            href="https://github.com/gozajpeg/barstile/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            MIT License
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
