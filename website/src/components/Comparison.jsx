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
          <h2 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-none">
            Defense should include your APIs and endpoints.
          </h2>
          <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-none mt-1 sm:mt-0.5">
            Not just about your frontend.
          </p>
        </div>

        {/* 3-Column Horizontal Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08] border-t border-b border-white/[0.08]">
          {/* Card 1: Self-hosted Server & APIs */}
          <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full">
            <div className="h-[240px] sm:h-[260px] flex items-center justify-center w-full shrink-0">
              <IsometricServer className="w-full max-w-[280px] h-[220px]" />
            </div>

            <div className="text-left w-full mt-4">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white mb-1.5 leading-snug">
                REST APIs & Endpoints
              </h3>
              <p className="text-[20px] sm:text-[24px] text-zinc-400 font-normal leading-normal">
                Protects API routes and server load on your own server, no tracking, no third parties, completely private.
              </p>
            </div>
          </div>

          {/* Card 2: Frictionless Filters */}
          <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full">
            <div className="h-[240px] sm:h-[260px] flex items-center justify-center w-full shrink-0">
              <IsometricFilter className="w-full max-w-[280px] h-[220px]" />
            </div>

            <div className="text-left w-full mt-4">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white mb-1.5 leading-snug">
                Frictionless Filters
              </h3>
              <p className="text-[20px] sm:text-[24px] text-zinc-400 font-normal leading-normal">
                Stops credential stuffing and form spam in the background with no visual puzzles.
              </p>
            </div>
          </div>

          {/* Card 3: Transparent Scaling */}
          <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full">
            <div className="h-[240px] sm:h-[260px] flex items-center justify-center w-full shrink-0">
              <IsometricMath className="w-full max-w-[280px] h-[220px]" />
            </div>

            <div className="text-left w-full mt-4">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white mb-1.5 leading-snug">
                Transparent Scaling
              </h3>
              <p className="text-[20px] sm:text-[24px] text-zinc-400 font-normal leading-normal">
                Client-side math-based PoW that resolves without user interruption, keeping your server CPU and memory flat as traffic scales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Comparison;
