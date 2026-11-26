import React from 'react';

const FRAMEWORKS = {
  row1: [
    { name: 'Node.js', icon: '/frameworks/nodejs.svg' },
    { name: 'Bun', icon: '/frameworks/bun.svg' },
    { name: 'Deno', icon: '/frameworks/deno.svg' },
    { name: 'Next.js', icon: '/frameworks/nextjs.svg' },
    { name: 'Express', icon: '/frameworks/express.svg' },
    { name: 'React', icon: '/frameworks/react.svg' }
  ],
  row2: [
    { name: 'Vue', icon: '/frameworks/vue.svg' },
    { name: 'Svelte', icon: '/frameworks/svelte.svg' },
    { name: 'Fastify', icon: '/frameworks/fastify.svg' }
  ],
  row3: [
    { name: 'Hono', icon: '/frameworks/hono.svg' },
    { name: 'Astro', icon: '/frameworks/astro.svg' },
    { name: 'Angular', icon: '/frameworks/angular.svg' },
    { name: 'Solid', icon: '/frameworks/solidjs.svg' }
  ],
  row4: [
    { name: 'Remix', icon: '/frameworks/remix.svg' },
    { name: 'Koa', icon: '/frameworks/koa.svg' }
  ]
};

function Cell({ fw }) {
  return (
    <div
      title={fw.name}
      className="w-10 h-10 sm:w-12 sm:h-12 border border-white/[0.12] -mr-px -mb-px flex items-center justify-center bg-white/[0.015] hover:border-white/[0.4] hover:bg-white/[0.08] transition-all duration-200 group cursor-default relative shrink-0 z-0 hover:z-10"
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

function EmptyCell() {
  return <div className="w-10 h-10 sm:w-12 sm:h-12 -mr-px -mb-px shrink-0 pointer-events-none" />;
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
          {/* Top Full-Width Hero Card: Split Layout (Text Left, Equalizer Wireframe Right) */}
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

            {/* Right Side: Equalizer Wireframe Grid (6, 3, 4, 2) matching exact blueprint */}
            <div className="flex flex-col shrink-0 self-center lg:self-auto py-2">
              {/* Row 1: 6 connected square cells */}
              <div className="flex">
                {FRAMEWORKS.row1.map((fw) => (
                  <Cell key={fw.name} fw={fw} />
                ))}
              </div>

              {/* Row 2: 2 empty spacer slots + 3 connected square cells */}
              <div className="flex">
                <EmptyCell />
                <EmptyCell />
                {FRAMEWORKS.row2.map((fw) => (
                  <Cell key={fw.name} fw={fw} />
                ))}
              </div>

              {/* Row 3: 2 empty spacer slots + 4 connected square cells */}
              <div className="flex">
                <EmptyCell />
                <EmptyCell />
                {FRAMEWORKS.row3.map((fw) => (
                  <Cell key={fw.name} fw={fw} />
                ))}
              </div>

              {/* Row 4: 4 empty spacer slots + 2 connected square cells */}
              <div className="flex">
                <EmptyCell />
                <EmptyCell />
                <EmptyCell />
                <EmptyCell />
                {FRAMEWORKS.row4.map((fw) => (
                  <Cell key={fw.name} fw={fw} />
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
