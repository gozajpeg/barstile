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
    const spacing = 165; // spacing between [icon + name] chips
    const totalSpan = count * spacing;

    // True circular arc parameters (uniform curvature from left edge to right edge)
    const cx = 600;
    const apexY = 55;
    const R = 1500;
    const cy = apexY + R; // 1555

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
        if (x < -300) x += totalSpan;

        const dx = x - cx;
        const absDx = Math.abs(dx);

        // Hide items far outside visible boundaries
        if (absDx > 750) {
          if (g.style.visibility !== 'hidden') {
            g.style.visibility = 'hidden';
            img.style.opacity = '0';
            txt.style.opacity = '0';
          }
          continue;
        }

        // 1. True circular arc: uniform curve across whole span with zero flat edges
        const safeDx = Math.max(-R + 1, Math.min(R - 1, dx));
        const y = cy - Math.sqrt(R * R - safeDx * safeDx);
        const rot = Math.asin(safeDx / R) * (180 / Math.PI);

        // Normalized distance from center (0 at apex, 1 at 650px outer boundaries)
        const normDist = Math.min(absDx / 650, 1);
        const cosFactor = (Math.cos(normDist * Math.PI) + 1) / 2;

        // 2. Proportional scale: scales icon + name together smoothly (0.72 at sides to 1.14 in center)
        const scale = (0.72 + 0.42 * cosFactor).toFixed(3);

        // 3. Dynamic Center Color Reveal:
        // absDx <= 180 -> 0% grayscale (100% full vibrant authentic color)
        // absDx >= 460 -> 100% grayscale (muted monochrome)
        // 180 to 460   -> smooth color fade transition
        let grayscale = 100;
        let textBright = 113; // #71717a

        if (absDx <= 180) {
          grayscale = 0;
          textBright = 244; // #f4f4f5
        } else if (absDx < 460) {
          const colorRatio = (absDx - 180) / 280; // 0 at center, 1 at edges
          grayscale = Math.round(colorRatio * 100);
          textBright = Math.round(244 - colorRatio * 131);
        }

        // 4. Smooth Edge Dissolve at outer margins (zero pop on entry/exit)
        let opacity = 0;
        if (absDx < 680) {
          const edgeFade = absDx > 520 ? (680 - absDx) / 160 : 1.0;
          opacity = Math.max(0, (0.4 + 0.6 * cosFactor) * edgeFade);
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

        // Apply dynamic grayscale filter to logo and color brightness to text
        img.style.filter = `grayscale(${grayscale}%) brightness(${grayscale === 0 ? 100 : 85}%) contrast(${grayscale === 0 ? 100 : 85}%)`;
        txt.style.fill = `rgb(${textBright}, ${textBright}, ${textBright})`;

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
      className="w-full h-[170px] sm:h-[195px] relative overflow-hidden pointer-events-none select-none mt-4 sm:mt-6"
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)'
      }}
    >
      <svg
        viewBox="0 0 1200 190"
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
            {/* Logo Icon on Left Side */}
            <image
              ref={(el) => (imagesRef.current[idx] = el)}
              href={fw.icon}
              width="42"
              height="42"
              x="-48"
              y="-21"
              preserveAspectRatio="xMidYMid meet"
              style={{
                filter: 'grayscale(100%)',
                opacity: 0,
                transition: 'none'
              }}
            />
            {/* Framework Name on Right Side (scales proportionally with icon) */}
            <text
              ref={(el) => (textsRef.current[idx] = el)}
              x="4"
              y="6"
              textAnchor="start"
              fontFamily="monospace"
              fontSize="14"
              fontWeight="600"
              letterSpacing="0.02em"
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

            {/* Big Curved Non-Hoverable Marquee with Side-by-Side Name & Continuous Arc */}
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
