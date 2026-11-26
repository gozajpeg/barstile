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

export function RuntimeLogos() {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const imagesRef = useRef([]);
  const isHovered = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Exact arc geometry matching HeroArc.jsx
    // Path: M -20,20 A 1040 1040 0 0,0 1940,20
    // Center: (960, -328.1), Arc stroke radius: 1040
    // Outside offset radius: 1040 + 28 = 1068
    const cx = 960;
    const cy = -328.1;
    const R = 1068;

    // Angular spacing between logos along the arc
    const dTheta = 0.075;
    const count = REPEATED_FRAMEWORKS.length;
    const totalSpan = count * dTheta;
    const maxVisibleTheta = 0.85;

    let animId;
    let offset = 0;
    const startTime = performance.now();
    let lastTime = startTime;
    let isVisible = true;

    const tick = (now) => {
      if (!isVisible) return;

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isHovered.current) {
        const elapsed = now - startTime;
        let speed = 0;
        if (elapsed >= 1800) {
          const boost = elapsed < 4800 ? 0.45 * Math.pow(1 - (elapsed - 1800) / 3000, 3) : 0;
          speed = 0.038 + boost;
        }
        offset += speed * dt;
      }

      for (let i = 0; i < count; i++) {
        const g = itemsRef.current[i];
        const img = imagesRef.current[i];
        if (!g || !img) continue;

        let raw = (i * dTheta - offset) % totalSpan;
        if (raw < 0) raw += totalSpan;
        const theta = raw - totalSpan / 2;

        const absTheta = Math.abs(theta);

        // Skip calculations for items far outside the visible arc
        if (absTheta > maxVisibleTheta + 0.15) {
          if (g.style.visibility !== 'hidden') {
            g.style.visibility = 'hidden';
            img.style.opacity = '0';
          }
          continue;
        }

        const dist = Math.min(absTheta / maxVisibleTheta, 1);

        // Position along the outside perimeter of the circular arc
        const x = cx + R * Math.sin(theta);
        const y = cy + R * Math.cos(theta);
        const rot = theta * (180 / Math.PI);

        // 1. Continuous Scale Progression:
        // Smaller at the sides (0.90), grows smoothly to full size (1.00) in the center,
        // and shrinks back down to smaller (0.90) as it approaches the sides to vanish.
        const cosFactor = (Math.cos(dist * Math.PI) + 1) / 2;
        const scale = (0.90 + 0.10 * cosFactor).toFixed(3);

        // 2. Blur: Strictly on outer 5% of the sides
        let blur = 0;
        if (dist > 0.80) {
          blur = (((dist - 0.80) / 0.20) * 2.5).toFixed(1);
        }

        // 3. Smooth Opacity: Starts at EXACTLY 0 at dist = 1.0 (no pop/blink when entering),
        // fades in smoothly towards the middle, and reaches 1.0 at center.
        let opacity = 0;
        if (dist < 1.0) {
          const baseOpacity = 0.60 + 0.40 * cosFactor;
          const fadeFactor = dist > 0.65 ? (dist - 0.65) / 0.35 : 0;
          opacity = Math.max(0, baseOpacity * (1 - fadeFactor));
        }

        // Hide completely when opacity is zero to eliminate click interception off-screen
        if (opacity <= 0.001) {
          g.style.visibility = 'hidden';
          img.style.opacity = '0';
        } else {
          g.style.visibility = 'visible';
          img.style.opacity = opacity.toFixed(3);
        }

        g.setAttribute(
          'transform',
          `translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${scale})`
        );

        // Default: strictly monochrome gray (grayscale 100% + balanced brightness/contrast)
        img.style.filter = blur > 0
          ? `grayscale(100%) contrast(80%) brightness(85%) blur(${blur}px)`
          : 'grayscale(100%) contrast(80%) brightness(85%)';
      }

      animId = requestAnimationFrame(tick);
    };

    // Pause RAF loop when scrolled out of view to save 100% of background CPU/battery
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          lastTime = performance.now();
          cancelAnimationFrame(animId);
          animId = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(container);

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-10 select-none"
      style={{ animation: 'innerGlowFade 700ms ease-out 1800ms both' }}
      role="region"
      aria-label="Supported frameworks and runtimes"
    >
      <style>{`
        .arc-logo-image {
          transition: filter 0.25s ease;
          will-change: filter;
        }
        .arc-logo-group:hover .arc-logo-image {
          filter: none !important;
          opacity: 1 !important;
        }
      `}</style>

      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible pointer-events-none"
      >
        {REPEATED_FRAMEWORKS.map((fw, idx) => (
          <g
            key={`${fw.name}-${idx}`}
            ref={(el) => (itemsRef.current[idx] = el)}
            className="pointer-events-auto cursor-pointer arc-logo-group group"
            onMouseEnter={() => (isHovered.current = true)}
            onMouseLeave={() => (isHovered.current = false)}
          >
            <image
              ref={(el) => (imagesRef.current[idx] = el)}
              href={fw.icon}
              x="-16"
              y="-16"
              width="32"
              height="32"
              className="arc-logo-image"
            />
            <title>{fw.name}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default RuntimeLogos;
