import React from 'react';

const FRAMEWORKS_ROW1 = [
  { name: 'Node.js', icon: '/frameworks/nodejs.svg' },
  { name: 'Bun', icon: '/frameworks/bun.svg' },
  { name: 'Deno', icon: '/frameworks/deno.svg' },
  { name: 'Next.js', icon: '/frameworks/nextjs.svg' },
  { name: 'Express', icon: '/frameworks/express.svg' },
  { name: 'React', icon: '/frameworks/react.svg' }
];

const FRAMEWORKS_ROW2 = [
  { name: 'Vue', icon: '/frameworks/vue.svg' },
  { name: 'Svelte', icon: '/frameworks/svelte.svg' },
  { name: 'Fastify', icon: '/frameworks/fastify.svg' }
];

const FRAMEWORKS_ROW3 = [
  { name: 'Hono', icon: '/frameworks/hono.svg' },
  { name: 'Astro', icon: '/frameworks/astro.svg' },
  { name: 'Angular', icon: '/frameworks/angular.svg' },
  { name: 'Solid', icon: '/frameworks/solidjs.svg' }
];

const FRAMEWORKS_ROW4 = [
  { name: 'Remix', icon: '/frameworks/remix.svg' },
  { name: 'Koa', icon: '/frameworks/koa.svg' }
];

function FrameworkIcon({ fw }) {
  return (
    <div
      title={fw.name}
      className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center hover:border-white/[0.25] hover:bg-white/[0.06] transition-all duration-200 group cursor-default shrink-0"
    >
      <img
        src={fw.icon}
        alt={fw.name}
        className="w-5 h-5 sm:w-6 sm:h-6 object-contain filter grayscale opacity-60 group-hover:filter-none group-hover:opacity-100 transition-all duration-200"
        loading="lazy"
      />
    </div>
  );
}

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
          {/* Top Full-Width Hero Card: Split Layout (Text Left, Equalizer Right) */}
          <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 p-6 sm:p-8 lg:p-10">
            {/* Left Side: Punchy Typography */}
            <div className="max-w-md">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                15 JS & TS frameworks.
              </h3>
              <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5">
                And counting.
              </p>
            </div>

            {/* Right Side: Equalizer Stagger (6, 3, 4, 2) without outer wrapper box */}
            <div className="flex flex-col gap-2 sm:gap-2.5 shrink-0">
              {/* Row 1: 6 icons */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {FRAMEWORKS_ROW1.map((fw) => (
                  <FrameworkIcon key={fw.name} fw={fw} />
                ))}
              </div>

              {/* Row 2: 3 icons */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {FRAMEWORKS_ROW2.map((fw) => (
                  <FrameworkIcon key={fw.name} fw={fw} />
                ))}
              </div>

              {/* Row 3: 4 icons */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {FRAMEWORKS_ROW3.map((fw) => (
                  <FrameworkIcon key={fw.name} fw={fw} />
                ))}
              </div>

              {/* Row 4: 2 icons */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {FRAMEWORKS_ROW4.map((fw) => (
                  <FrameworkIcon key={fw.name} fw={fw} />
                ))}
              </div>
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
