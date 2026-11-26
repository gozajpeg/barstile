import React from 'react';

const BENCHMARK_METRICS = [
  {
    id: 'script-download',
    stat: '-90%',
    title: 'Script Download',
    otherValue: '184 KB',
    otherWidth: '36.8%', // Based on 500 KB: 184 / 500 = 36.8%
    isOtherFull: false,
    barstileValue: '18.2 KB',
    barstileWidth: '3.6%' // Based on 500 KB: 18.2 / 500 = 3.64%
  },
  {
    id: 'server-latency',
    stat: '-99.9%',
    title: 'Server Latency',
    otherValue: '34.7 ms',
    otherWidth: '7%', // Based on 0.5s (500 ms): 34.7 / 500 = 6.94%
    isOtherFull: false,
    barstileValue: '0.04 ms',
    barstileWidth: '1.5%' // Small visible indicator amount
  },
  {
    id: 'external-tracking',
    stat: '0',
    title: 'External Tracking',
    otherValue: 'Tracked',
    otherWidth: '100%',
    isOtherFull: true, // Chart is full -> word is inside right side
    barstileValue: 'None',
    barstileWidth: '1.5%' // Small visible indicator amount
  }
];

// Repeating diagonal crossed-out stripes pattern for "Other"
const HATCHED_PATTERN =
  'repeating-linear-gradient(135deg, rgba(255,255,255,0.09) 0px, rgba(255,255,255,0.09) 6px, rgba(255,255,255,0.02) 6px, rgba(255,255,255,0.02) 12px)';

export function Benchmarks() {
  return (
    <section
      id="benchmarks"
      className="w-full flex flex-col items-center justify-center px-6 sm:px-12 py-24 select-none content-lazy"
    >
      <div className="max-w-5xl w-full mx-auto">
        {/* Section Top Heading: Standard Barstile Site-Wide Typography */}
        <div className="mb-14 sm:mb-16 text-center">
          <h2 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-none">
            Protection shouldn't feel bloated.
          </h2>
          <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-none mt-1 sm:mt-0.5">
            Not in the browser, not on the server.
          </p>
        </div>

        {/* 3 Comparison Rows */}
        <div className="flex flex-col gap-10 sm:gap-12">
          {BENCHMARK_METRICS.map((metric) => (
            <div
              key={metric.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            >
              {/* Left Column: Big Stat & Title in standard Barstile fonts */}
              <div className="md:col-span-4 lg:col-span-3 flex flex-col justify-center">
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono leading-none">
                  {metric.stat}
                </div>
                <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white mt-1.5 leading-snug">
                  {metric.title}
                </h3>
              </div>

              {/* Right Column: Freestanding bars with uniform border-radius (no outer container, no cuts) */}
              <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-3.5">
                {/* Other Bar */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono text-zinc-400 px-0.5">Other</span>
                  <div className="flex items-center w-full">
                    {metric.isOtherFull ? (
                      /* When bar is full: value sits inside on the right side */
                      <div
                        style={{ width: '100%', background: HATCHED_PATTERN }}
                        className="h-9 sm:h-10 rounded-md border border-white/[0.15] flex items-center justify-end pr-4 text-xs font-mono text-zinc-300 font-medium"
                      >
                        {metric.otherValue}
                      </div>
                    ) : (
                      /* When bar is not full: freestanding bar with uniform radius, value beside it */
                      <div className="flex items-center w-full">
                        <div
                          style={{ width: metric.otherWidth, background: HATCHED_PATTERN }}
                          className="h-9 sm:h-10 rounded-md border border-white/[0.15] shrink-0 transition-all duration-700"
                        />
                        <span className="pl-3 text-xs font-mono text-zinc-300 whitespace-nowrap">
                          {metric.otherValue}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Barstile Bar */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono text-white font-medium px-0.5">
                    Barstile
                  </span>
                  <div className="flex items-center w-full">
                    <div
                      style={{ width: metric.barstileWidth }}
                      className="h-9 sm:h-10 min-w-[12px] rounded-md bg-sky-500/25 border border-sky-400/60 shrink-0 transition-all duration-700"
                    />
                    <span className="pl-3 text-xs font-mono text-sky-400 font-bold whitespace-nowrap">
                      {metric.barstileValue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Benchmarks;
