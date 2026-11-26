import React from 'react';
import { BlueprintGate } from './BlueprintGate.jsx';
import { UtilityPole } from './UtilityPole.jsx';
import { NoDesignNeeded } from './NoDesignNeeded.jsx';

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
      className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border border-white/[0.12] -mr-px -mb-px flex items-center justify-center p-1 sm:p-1.5 lg:p-1.5 bg-white/[0.015] hover:border-white/[0.4] hover:bg-white/[0.08] transition-all duration-200 group cursor-default relative shrink-0 z-0 hover:z-20"
    >
      <img
        src={fw.icon}
        alt={fw.name}
        className="w-full h-full object-contain opacity-100 group-hover:scale-105 transition-all duration-200"
        loading="lazy"
      />
    </div>
  );
}

function EmptyCell() {
  return <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 -mr-px -mb-px shrink-0 pointer-events-none" />;
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
            {/* Card 1: 15 Frameworks with Equalizer Wireframe Matrix */}
            <div className="relative flex flex-col justify-end p-6 sm:p-7 lg:p-7 h-full overflow-hidden min-h-[240px] sm:min-h-0">
              {/* Right: Equalizer Wireframe Grid */}
              <div className="flex flex-col shrink-0 self-end z-0">
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

              {/* Left: 1-Line Headline + Stacked Subtext aligned with last icons at bottom */}
              <div className="absolute bottom-6 sm:bottom-7 lg:bottom-7 left-6 sm:left-7 lg:left-7 z-10 pointer-events-none">
                <h3 className="text-[18px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug whitespace-nowrap">
                  15 JS & TS frameworks.
                </h3>
                <p className="text-[18px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5 whitespace-nowrap">
                  And counting.
                </p>
              </div>
            </div>

            {/* Card 2: Silent Treatment with Architectural Blueprint Gate */}
            <div className="relative flex flex-col justify-between sm:justify-end p-6 sm:p-7 lg:p-7 h-full overflow-hidden min-h-[300px] sm:min-h-0">
              {/* Gate Illustration: Centered on mobile, flush right on desktop */}
              <div className="flex justify-center sm:justify-end shrink-0 z-0 sm:self-end">
                <BlueprintGate />
              </div>

              {/* Headline + Subtext: Below gate on mobile, bottom-left aligned on desktop */}
              <div className="z-10 mt-6 sm:mt-0 sm:absolute sm:bottom-7 sm:left-7 pointer-events-none">
                <h3 className="text-[18px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug whitespace-nowrap">
                  Silent treatment.
                </h3>
                <p className="text-[18px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5 whitespace-nowrap">
                  Work with a reason.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom 2-Column Grid: Perfectly balanced 2x2 Bento with Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {/* Card 3: No Third Parties with Utility Pole Graphic */}
            <div className="relative flex flex-col justify-end p-6 sm:p-7 lg:p-7 h-full overflow-hidden min-h-[260px] sm:min-h-[280px]">
              {/* Graphic: Utility Pole with dedicated clean lines */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-end overflow-hidden z-0">
                <UtilityPole />
              </div>

              {/* Text: z-10 on bottom-left, matching Card 1 */}
              <div className="absolute bottom-6 sm:bottom-7 lg:bottom-7 left-6 sm:left-7 lg:left-7 z-10 pointer-events-none">
                <h3 className="text-[18px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug whitespace-nowrap">
                  No third parties.
                </h3>
                <p className="text-[18px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5 whitespace-nowrap">
                  None accumulated.
                </p>
              </div>
            </div>

            {/* Card 4: Combined Zero Cookies & No Analytics */}
            <div className="relative flex flex-col justify-end p-6 sm:p-7 lg:p-7 h-full overflow-hidden min-h-[260px] sm:min-h-[280px]">
              {/* Graphic: Big, Centered Animated Cursive Writing */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 pb-16 sm:pb-20">
                <NoDesignNeeded />
              </div>

              <div className="absolute bottom-6 sm:bottom-7 lg:bottom-7 left-6 sm:left-7 lg:left-7 z-10 pointer-events-none">
                <h3 className="text-[18px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug whitespace-nowrap">
                  Zero cookies. No analytics.
                </h3>
                <p className="text-[18px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5 whitespace-nowrap">
                  Not even the crumbs. Just pure work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pillars;
