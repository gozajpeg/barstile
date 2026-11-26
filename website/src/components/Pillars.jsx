import React, { useEffect, useRef } from 'react';

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

// Repeat 3x (45 items) so wrapping occurs far off-screen with zero visible jumps
const REPEATED_FRAMEWORKS = [...FRAMEWORKS, ...FRAMEWORKS, ...FRAMEWORKS];

/* -------------------------------------------------------------------------- */
/* Big Curved Non-Hoverable Runtime Marquee (Right-to-Left, Center Apex)     */
/* -------------------------------------------------------------------------- */
function FrameworksMarquee() {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const imagesRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const count = REPEATED_FRAMEWORKS.length;
    const spacing = 110; // spacing between logos
    const totalSpan = count * spacing;

    let animId;
    let offset = 0;
    let lastTime = performance.now();
    let isVisible = true;

    const tick = (now) => {
      if (!isVisible) return;

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Drift speed in pixels per second (Right to Left drift)
      offset += 48 * dt;

      for (let i = 0; i < count; i++) {
        const g = itemsRef.current[i];
        const img = imagesRef.current[i];
        if (!g || !img) continue;

        // Calculate x position along track
        let x = (i * spacing - offset) % totalSpan;
        if (x < -200) x += totalSpan;

        // Normalized distance from center (cx = 600, range -1 to 1 across visible 1200px)
        const dist = (x - 600) / 600;
        const absDist = Math.abs(dist);

        // Hide items outside visible range
        if (absDist > 1.2) {
          if (g.style.visibility !== 'hidden') {
            g.style.visibility = 'hidden';
            img.style.opacity = '0';
          }
          continue;
        }

        // Cosine factor: 1.0 at center (apex), 0.0 at outer edges
        const cosFactor = (Math.cos(Math.min(absDist, 1) * Math.PI) + 1) / 2;

        // 1. Subtle organic curve: Apex at y = 65, gentle 38px downward curve towards edges (y = 103)
        const y = 65 + (1 - cosFactor) * 38;

        // 2. Gentle tilt angle along the curve (-8deg on left to +8deg on right)
        const rot = dist * 8;

        // 3. Dramatic Scale: 1.22 in center (large ~66px), drops to 0.35 at edges (~19px)
        const scale = (0.35 + 0.87 * cosFactor).toFixed(3);

        // 4. Smooth Edge Opacity: exactly 0 at absDist >= 1.0 (zero pop on entry/exit)
        let opacity = 0;
        if (absDist < 1.0) {
          const edgeFade = absDist > 0.72 ? (1.0 - absDist) / 0.28 : 1.0;
          opacity = Math.max(0, (0.35 + 0.65 * cosFactor) * edgeFade);
        }

        if (opacity <= 0.001) {
          g.style.visibility = 'hidden';
          img.style.opacity = '0';
        } else {
          g.style.visibility = 'visible';
          img.style.opacity = opacity.toFixed(3);
        }

        g.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg) scale(${scale})`;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Sleep animation when off-screen to preserve CPU
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          lastTime = performance.now();
          animId = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[140px] sm:h-[160px] relative overflow-hidden pointer-events-none select-none mt-4 sm:mt-6"
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
      }}
    >
      <svg
        viewBox="0 0 1200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="geometricPrecision"
      >
        {REPEATED_FRAMEWORKS.map((fw, idx) => (
          <g
            key={`${fw.name}-${idx}`}
            ref={(el) => (itemsRef.current[idx] = el)}
            style={{
              willChange: 'transform',
              transformOrigin: '0 0',
              visibility: 'hidden'
            }}
          >
            <image
              ref={(el) => (imagesRef.current[idx] = el)}
              href={fw.icon}
              width="54"
              height="54"
              x="-27"
              y="-27"
              preserveAspectRatio="xMidYMid meet"
              style={{
                filter: 'grayscale(100%) contrast(85%) brightness(85%)',
                opacity: 0,
                transition: 'none'
              }}
            />
          </g>
        ))}
      </svg>
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
          {/* Top Full-Width Hero Card: 15 Frameworks with Big Curved Marquee */}
          <div className="w-full flex flex-col p-6 sm:p-8 lg:p-10 justify-between overflow-hidden">
            <div>
              <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                15 JS & TS frameworks.
              </h3>
              <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug mt-1 sm:mt-0.5">
                And counting.
              </p>
            </div>

            {/* Big Curved Non-Hoverable Marquee */}
            <FrameworksMarquee />
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
