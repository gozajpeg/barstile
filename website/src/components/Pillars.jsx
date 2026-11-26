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
      className="w-11 h-11 sm:w-12 sm:h-12 lg:w-[50px] lg:h-[50px] border border-white/[0.12] -mr-px -mb-px flex items-center justify-center bg-white/[0.015] hover:border-white/[0.4] hover:bg-white/[0.08] transition-all duration-200 group cursor-default relative shrink-0 z-0 hover:z-10"
    >
      <img
        src={fw.icon}
        alt={fw.name}
        className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 object-contain filter grayscale opacity-70 group-hover:filter-none group-hover:opacity-100 transition-all duration-200"
        loading="lazy"
      />
    </div>
  );
}

function EmptyCell() {
  return <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-[50px] lg:h-[50px] -mr-px -mb-px shrink-0 pointer-events-none" />;
}

/* -------------------------------------------------------------------------- */
/* Main Pillars Section Component (2 + 3 Bento Layout)                         */
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

        {/* 2 + 3 Bento Grid Container with Section 2 Divider Styling */}
        <div className="border-t border-b border-white/[0.08] divide-y divide-white/[0.08]">
          {/* Top 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            {/* Card 1: 15 Frameworks with Equalizer Wireframe Matrix Aligned at Bottom Side-by-Side */}
            <div className="flex flex-col justify-end p-6 sm:p-8 lg:p-10 h-full">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 w-full">
                {/* Left: 1-Line Headline + Stacked Subtext */}
                <div className="shrink-0">
                  <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug whitespace-nowrap">
                    15 JS & TS frameworks.
                  </h3>
                  <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5 whitespace-nowrap">
                    And counting.
                  </p>
                </div>

                {/* Right: Equalizer Wireframe Grid aligned at bottom */}
                <div className="flex flex-col shrink-0 self-end sm:self-auto">
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
            </div>

            {/* Card 2: Silent Treatment (Option 2) */}
            <div className="flex flex-col justify-end p-6 sm:p-8 lg:p-10 h-full">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug whitespace-nowrap">
                Silent treatment.
              </h3>
              <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5">
                Work with a reason.
              </p>
            </div>
          </div>

          {/* Bottom 3-Column Grid: Exact Same Container & Card Sizing as Section 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {/* Card 3: No Third Parties */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full justify-end">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                No third parties.
              </h3>
              <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5">
                None accumulated.
              </p>
            </div>

            {/* Card 4: Zero Cookies */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full justify-end">
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                Zero cookies.
              </h3>
              <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5">
                Not even the crumbs.
              </p>
            </div>

            {/* Card 5: No Analytics */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10 h-full justify-end">
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
