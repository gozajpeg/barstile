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
/* Big Curved Non-Hoverable Runtime Marquee with Dynamic Center Color Reveal   */
/* -------------------------------------------------------------------------- */
function FrameworksMarquee() {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const imagesRef = useRef([]);
  const textsRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const count = REPEATED_FRAMEWORKS.length;
    const spacing = 125; // spacing between logo + name pairs
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
      offset += 46 * dt;

      for (let i = 0; i < count; i++) {
        const g = itemsRef.current[i];
        const img = imagesRef.current[i];
        const txt = textsRef.current[i];
        if (!g || !img || !txt) continue;

        // Calculate x position along track
        let x = (i * spacing - offset) % totalSpan;
        if (x < -200) x += totalSpan;

        // Normalized distance from center (cx = 600, range -1 to 1 across visible 1200px)
        const dist = (x - 600) / 600;
        const absDist = Math.abs(dist);

        // Hide items outside visible range
        if (absDist > 1.25) {
          if (g.style.visibility !== 'hidden') {
            g.style.visibility = 'hidden';
            img.style.opacity = '0';
            txt.style.opacity = '0';
          }
          continue;
        }

        // Cosine factor: 1.0 at center (apex), 0.0 at outer edges
        const cosFactor = (Math.cos(Math.min(absDist, 1) * Math.PI) + 1) / 2;

        // 1. Natural, gentle circular/cosine curve: Apex at y = 60, smooth 42px curve down to y = 102
        const y = 60 + (1 - cosFactor) * 42;

        // 2. Smooth tangent rotation along the curve (-9deg on left to +9deg on right)
        const rot = dist * 9;

        // 3. Balanced, proportional scale: 0.78 at edges up to 1.12 at center (no harsh fisheye pinch)
        const scale = (0.78 + 0.34 * cosFactor).toFixed(3);

        // 4. Dynamic Center Color Reveal:
        // absDist <= 0.20 -> 0% grayscale (100% full vibrant authentic color)
        // absDist >= 0.55 -> 100% grayscale (muted monochrome)
        // 0.20 to 0.55   -> smooth color fade transition
        let grayscale = 100;
        let textBrightness = 113; // #71717a

        if (absDist <= 0.20) {
          grayscale = 0;
          textBrightness = 244; // #f4f4f5
        } else if (absDist < 0.55) {
          const colorRatio = (absDist - 0.20) / 0.35; // 0 at center, 1 at edges
          grayscale = Math.round(colorRatio * 100);
          textBrightness = Math.round(244 - colorRatio * 131);
        }

        // 5. Smooth Edge Dissolve: exactly 0 at absDist >= 1.05 (zero pop)
        let opacity = 0;
        if (absDist < 1.05) {
          const edgeFade = absDist > 0.75 ? (1.05 - absDist) / 0.30 : 1.0;
          opacity = Math.max(0, (0.45 + 0.55 * cosFactor) * edgeFade);
        }

        if (opacity <= 0.001) {
          g.style.visibility = 'hidden';
          img.style.opacity = '0';
          txt.style.opacity = '0';
        } else {
          g.style.visibility = 'visible';
          img.style.opacity = opacity.toFixed(3);
          txt.style.opacity = (opacity * 0.95).toFixed(3);
        }

        // Apply dynamic grayscale filter
        img.style.filter = `grayscale(${grayscale}%) brightness(${grayscale === 0 ? 100 : 85}%) contrast(${grayscale === 0 ? 100 : 85}%)`;
        txt.style.fill = `rgb(${textBrightness}, ${textBrightness}, ${textBrightness})`;

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
      className="w-full h-[160px] sm:h-[185px] relative overflow-hidden pointer-events-none select-none mt-4 sm:mt-6"
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
      }}
    >
      <svg
        viewBox="0 0 1200 175"
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
              width="48"
              height="48"
              x="-24"
              y="-26"
              preserveAspectRatio="xMidYMid meet"
              style={{
                filter: 'grayscale(100%)',
                opacity: 0,
                transition: 'none'
              }}
            />
            <text
              ref={(el) => (textsRef.current[idx] = el)}
              x="0"
              y="36"
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="11"
              fontWeight="600"
              letterSpacing="0.03em"
              style={{
                fill: '#71717a',
                opacity: 0,
                transition: 'none'
              }}
            >
              {fw.name}
            </text>
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

            {/* Big Curved Non-Hoverable Marquee with Dynamic Color Reveal & Names */}
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
