import React, { useState } from 'react';
import { ArrowRight, Github, Terminal, Copy, Check } from 'lucide-react';
import { FooterWave } from './FooterWave.jsx';
import { Footer } from './Footer.jsx';

export function Action({ onNavigate }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('npm install barstile');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="action"
      className="relative min-h-screen w-full flex flex-col justify-between px-6 select-none pt-20 pb-4 overflow-hidden"
    >
      {/* Scroll-activated Upward Horizon Wave & Bottom Glow */}
      <FooterWave />

      {/* Top spacer */}
      <div className="h-6" />

      {/* CTA Content: Centered safely INSIDE the wave crest */}
      <div className="relative z-10 max-w-4xl mx-auto my-auto text-center">
        {/* Editorial CTA Headline */}
        <h2 className="text-[24px] font-semibold tracking-tight text-white leading-none">
          Keep it safe, don't overdo.
        </h2>
        <p className="text-[24px] text-zinc-500 font-normal tracking-tight leading-none mt-0.5 mb-10">
          Simple integration is all you need.
        </p>

        {/* Combined Action Controls: Command Line, Docs, GitHub */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
          {/* Command Line Box with Copy */}
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto h-10 flex items-center justify-between gap-3 px-4 rounded-full bg-zinc-900/90 border border-white/[0.08] hover:border-white/[0.18] text-xs font-mono text-zinc-300 transition-all hover:bg-zinc-850 active:scale-95 shadow-sm group"
            title="Click to copy"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              <span>npm install barstile</span>
            </div>
            {copied ? (
              <span className="flex items-center gap-1 text-[11px] text-white font-sans">
                <Check className="w-3 h-3" />
                Copied
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
            )}
          </button>

          {/* Documentation Link */}
          <button
            onClick={() => onNavigate('docs')}
            className="w-full sm:w-auto h-10 flex items-center justify-center gap-1.5 px-5 rounded-full bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-all active:scale-95 shadow-md whitespace-nowrap cursor-pointer"
          >
            <span>Documentation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/gozajpeg/barstile"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto h-10 flex items-center justify-center gap-1.5 px-4 rounded-full bg-zinc-900/90 border border-white/[0.08] hover:border-white/[0.18] text-xs font-medium text-zinc-300 hover:text-white transition-all active:scale-95 shadow-sm whitespace-nowrap"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Integrated transparent footer as part of the wave floor */}
      <Footer onNavigate={onNavigate} />
    </section>
  );
}
