import React from 'react';
import { BarstileLogo } from './BarstileLogo.jsx';

export function Navbar({ currentView, onNavigate }) {
  const handleNav = (view) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none select-none">
      <div className="w-full max-w-md bg-[#090a0f]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl px-5 py-2.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto transition-all">
        {/* Brand / Home */}
        <button
          onClick={() => handleNav('landing')}
          className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer"
          aria-label="Barstile home"
        >
          <BarstileLogo className="w-3.5 h-3.5 text-white transition-transform group-hover:scale-110" />
          <span className="font-semibold text-white tracking-tight text-sm">Barstile</span>
        </button>

        {/* Dedicated Views */}
        <nav aria-label="Main Navigation" className="flex items-center gap-5 sm:gap-6 text-xs font-normal">
          <button
            onClick={() => handleNav('docs')}
            className={`transition-colors cursor-pointer ${
              currentView === 'docs'
                ? 'text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Documentation
          </button>
          <button
            onClick={() => handleNav('changelog')}
            className={`transition-colors cursor-pointer ${
              currentView === 'changelog'
                ? 'text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Changelog
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
