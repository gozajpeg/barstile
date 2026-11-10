import React from 'react';
import { IsometricServer } from './IsometricServer.jsx';
import { IsometricFilter } from './IsometricFilter.jsx';
import { IsometricMath } from './IsometricMath.jsx';

export function Comparison() {
  return (
    <section
      id="architecture"
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 sm:px-12 py-24 select-none content-lazy"
    >
      <div className="max-w-7xl w-full mx-auto">
        {/* Section Top Heading */}
        <div className="mb-16 text-center">
          <h2 className="text-[24px] font-semibold tracking-tight text-white leading-none">
            Engineered for humans.
          </h2>
          <p className="text-[24px] text-zinc-500 font-normal tracking-tight leading-none mt-0.5">
            Harsh on automated bots.
          </p>
        </div>

        {/* 3-Column Horizontal Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08] border-t border-b border-white/[0.08]">
          {/* Card 1: Self-hosted Server */}
          <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full">
            <div className="h-[240px] sm:h-[260px] flex items-center justify-center w-full shrink-0">
              <IsometricServer className="w-full max-w-[280px] h-[220px]" />
            </div>

            <div className="text-left w-full mt-4">
              <h3 className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-white mb-1 leading-snug">
                Self-hosted. Privacy first.
              </h3>
              <p className="text-[14px] text-zinc-400 font-normal leading-relaxed">
                No third parties, no tracking puzzles. Just you and your users' sanity.
              </p>
            </div>
          </div>

          {/* Card 2: Filter */}
          <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full">
            <div className="h-[240px] sm:h-[260px] flex items-center justify-center w-full shrink-0">
              <IsometricFilter className="w-full max-w-[280px] h-[220px]" />
            </div>

            <div className="text-left w-full mt-4">
              <h3 className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-white mb-1 leading-snug">
                Friction to bots, not on users.
              </h3>
              <p className="text-[14px] text-zinc-400 font-normal leading-relaxed">
                Zero captchas for humans. Progressive computational delay for scrapers.
              </p>
            </div>
          </div>

          {/* Card 3: Math Box */}
          <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full">
            <div className="h-[240px] sm:h-[260px] flex items-center justify-center w-full shrink-0">
              <IsometricMath className="w-full max-w-[280px] h-[220px]" />
            </div>

            <div className="text-left w-full mt-4">
              <h3 className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-white mb-1 leading-snug">
                Simple math. Real friction.
              </h3>
              <p className="text-[14px] text-zinc-400 font-normal leading-relaxed">
                Transparent proof-of-work. Deterministic cost scaling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Comparison;
