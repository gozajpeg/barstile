import React from 'react';

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
            <div className="md:col-span-7 flex flex-col p-8 sm:p-10 lg:p-12 justify-center h-full">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white mb-2 leading-snug">
                Zero Third Parties
              </h3>
              <p className="text-[15px] sm:text-[16px] text-zinc-400 font-normal leading-relaxed">
                Runs directly inside your server memory. Zero outbound HTTPS calls to Cloudflare, Google, or AWS. If your server is online, Barstile works offline.
              </p>
            </div>

            {/* Card 2: Zero Cookies (Compact: 5 cols) */}
            <div className="md:col-span-5 flex flex-col p-8 sm:p-10 lg:p-12 justify-center h-full">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white mb-2 leading-snug">
                Zero Cookies
              </h3>
              <p className="text-[15px] sm:text-[16px] text-zinc-400 font-normal leading-relaxed">
                No tracking cookies, no localStorage residue, and no persistent identifiers. 100% GDPR & ePrivacy compliant out of the box with zero cookie banners.
              </p>
            </div>
          </div>

          {/* Row 2: Compact Card (5 cols) + Wide Card (7 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {/* Card 3: Zero Telemetry (Compact: 5 cols) */}
            <div className="md:col-span-5 flex flex-col p-8 sm:p-10 lg:p-12 justify-center h-full">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white mb-2 leading-snug">
                Zero Analytics
              </h3>
              <p className="text-[15px] sm:text-[16px] text-zinc-400 font-normal leading-relaxed">
                We don't collect IP graphs, browser fingerprints, or user behavior to monetize threat networks. Just pure, uncompromised cryptographic proof-of-work.
              </p>
            </div>

            {/* Card 4: 15 Frameworks (Wide: 7 cols) */}
            <div className="md:col-span-7 flex flex-col p-8 sm:p-10 lg:p-12 justify-center h-full">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white mb-2 leading-snug">
                15 Native Frameworks
              </h3>
              <p className="text-[15px] sm:text-[16px] text-zinc-400 font-normal leading-relaxed">
                Drop-in middleware and client adapters for Next.js, Express, Fastify, Hono, Bun, Deno, Koa, and SvelteKit—with first-party types and zero build steps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pillars;
