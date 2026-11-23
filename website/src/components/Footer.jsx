import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BarstileLogo } from './BarstileLogo.jsx';

export function Footer({ onNavigate }) {
  const handleNav = (view) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 bg-transparent px-6 pt-6 pb-10 sm:py-14 text-xs select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
        {/* Brand & Hero Subtext */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <BarstileLogo className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white shrink-0" />
            <h2 className="text-3xl sm:text-4xl md:text-[48px] font-semibold tracking-[-0.03em] text-white leading-[1.15]">
              Barstile
            </h2>

            {/* Normal Light Pink Ringing Ko-fi Widget Button (Solid, zero transparency, zero glow) */}
            <div className="relative group shrink-0 ml-1">
              {/* Floating Tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all duration-200 z-30">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0e1017] border border-white/[0.12] text-[11px] font-medium text-zinc-200 whitespace-nowrap shadow-xl">
                  <span>Support on Ko-fi</span>
                  <span className="text-pink-400">❤</span>
                </div>
              </div>

              {/* The Widget Button */}
              <a
                href="https://ko-fi.com/gozajpeg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Support Barstile on Ko-fi"
                title="Support Barstile on Ko-fi"
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-2xl bg-pink-400 hover:bg-pink-300 text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              >
                {/* Ringing Bell Animation Container */}
                <div className="animate-ring-subtle group-hover:animate-none transition-transform duration-200">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                  >
                    <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.963-1.008-2.35-.13-3.26.984-1.029 2.507-.421 3.251.352.519.535.803.945.803.945s.262-.394.757-.912c.861-.902 2.472-1.332 3.376-.328.874.974.526 2.378-.594 3.247zm3.225-1.159c-.06 1.849-1.523 2.012-1.523 2.012H3.729c-.31 0-.56-.25-.56-.56V6.755c0-.31.25-.56.56-.56h10.793c.31 0 .56.25.56.56v4.545zm2.846-1.583c-.378 1.944-1.895 1.761-1.895 1.761V7.078c1.396.061 2.219.467 1.895 2.639z" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
          <p className="text-[18px] sm:text-[22px] text-zinc-400 font-normal tracking-tight leading-snug mt-2 max-w-xl">
            Self-hosted non-interactive bot protection
          </p>
        </div>

        {/* Right Side: Clean Unified Clickables */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start md:justify-end gap-5 sm:gap-6 text-xs text-zinc-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
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
