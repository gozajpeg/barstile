import React from 'react';

const FRAMEWORKS = [
  { name: 'Node.js', icon: '/frameworks/nodejs.svg' },
  { name: 'Bun', icon: '/frameworks/bun.svg' },
  { name: 'Deno', icon: '/frameworks/deno.svg' },
  { name: 'Next.js', icon: '/frameworks/nextjs.svg' },
  { name: 'Express', icon: '/frameworks/express.svg' },
  { name: 'React', icon: '/frameworks/react.svg' },
  { name: 'Vue', icon: '/frameworks/vue.svg' },
  { name: 'Svelte', icon: '/frameworks/svelte.svg' },
  { name: 'Fastify', icon: '/frameworks/fastify.svg' },
  { name: 'Hono', icon: '/frameworks/hono.svg' },
  { name: 'Astro', icon: '/frameworks/astro.svg' },
  { name: 'Angular', icon: '/frameworks/angular.svg' },
  { name: 'Solid', icon: '/frameworks/solidjs.svg' },
  { name: 'Remix', icon: '/frameworks/remix.svg' },
  { name: 'Koa', icon: '/frameworks/koa.svg' }
];

/* -------------------------------------------------------------------------- */
/* Main Pillars Section Component (1 + 3 Layout)                              */
/* -------------------------------------------------------------------------- */
export function Pillars() {
  return (
    <section
      id="pillars"
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 sm:px-12 py-24 select-none content-lazy"
    >
      <div className="max-w-7xl w-full mx-auto">
        {/* Section Top Heading: Exact Match to Section 2 Typography & Spacing */}
        <div className="mb-16 text-center">
          <h2 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-none">
            Privacy isn't a feature. It's the architecture.
          </h2>
          <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-none mt-1 sm:mt-0.5">
            Zero cookies, zero external dependencies, zero user profiling.
          </p>
        </div>

        {/* 1 + 3 Layout Container with Section 2 Divider Styling */}
        <div className="border-t border-b border-white/[0.08] divide-y divide-white/[0.08]">
          {/* Top Full-Width Hero Card: 15 Frameworks with Clean 5x3 Grid */}
          <div className="w-full flex flex-col p-6 sm:p-8 lg:p-10 justify-between">
            <div className="mb-6 sm:mb-8">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                15 JS & TS frameworks.
              </h3>
              <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5">
                And counting.
              </p>
            </div>

            {/* Clean 5x3 Grid (3-col mobile / 5-col desktop) */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3 w-full">
              {FRAMEWORKS.map((fw) => (
                <div
                  key={fw.name}
                  className="flex items-center gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-md border border-white/[0.08] bg-white/[0.015] hover:border-white/[0.22] hover:bg-white/[0.04] transition-all duration-200 group"
                >
                  <img
                    src={fw.icon}
                    alt={fw.name}
                    className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0 filter grayscale opacity-60 group-hover:filter-none group-hover:opacity-100 transition-all duration-200"
                    loading="lazy"
                  />
                  <span className="text-xs sm:text-[13px] font-mono text-zinc-400 group-hover:text-white transition-colors duration-200 truncate">
                    {fw.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 3-Column Grid: Exact Same Container & Card Sizing as Section 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {/* Card 1: No Third Parties */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full justify-center">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                No third parties.
              </h3>
              <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5">
                None accumulated.
              </p>
            </div>

            {/* Card 2: Zero Cookies */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full justify-center">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                Zero cookies.
              </h3>
              <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5">
                Not even the crumbs.
              </p>
            </div>

            {/* Card 3: No Analytics */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full justify-center">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                No analytics.
              </h3>
              <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5">
                Just pure work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pillars;
