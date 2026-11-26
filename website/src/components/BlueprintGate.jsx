import React, { useState, useEffect, useRef } from 'react';

/**
 * BlueprintGate Component
 * Modern architectural double gate inspired by high-end minimalist design:
 * - Overhead pergola canopy with horizontal cross-slats
 * - Flanking masonry stone pillars with clean horizontal block joints
 * - Finely fluted / ribbed dark double doors with center seam
 * - Tall, slender brushed brass vertical pull handles with latch lever
 *
 * Animation (Slow & Viewport-Triggered):
 * 1. ONLY triggers when scrolled into view (IntersectionObserver on Section/Card).
 *    Zero background execution while above the section.
 * 2. Blueprint Phase (0s – 2.6s): Slow, deliberate CAD laser drafting lines actively sketch
 *    the canopy, pillars, gate perimeter, and fluted ribs.
 *    Dimension callouts (4.20m, 3.40m), alignment crosshairs, and coordinate grid glow in cyan.
 * 3. Construction Phase (2.6s – 5.2s): Smooth materialization where solid masonry stone fills the pillars,
 *    vertical fluted slats gain 3D specular depth, and brass handles slide and gleam into place,
 *    while blueprint lines dissolve away.
 * 4. Solid Phase (5.2s+): Impenetrable, solid, dark architectural gate stands permanently.
 *    STRICTLY NON-LOOPING: Plays once on entry, never loops.
 */
export function BlueprintGate({ className = '' }) {
  const [phase, setPhase] = useState('idle');
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let timer1, timer2;

    // Trigger STRICTLY when the gate container enters the user's viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Disconnect immediately so it only triggers once
            observer.disconnect();
            setPhase('drafting');
            // Slow, deliberate build pacing:
            // Drafting: 0s to 2.6s
            // Building/Materializing: 2.6s to 5.2s
            // Solid permanent: 5.2s+
            timer1 = setTimeout(() => setPhase('building'), 2600);
            timer2 = setTimeout(() => setPhase('solid'), 5200);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const isIdle = phase === 'idle';
  const isDrafting = phase === 'drafting';
  const isBuilding = phase === 'building';
  const isSolid = phase === 'solid';

  // Opacities:
  // idle: blueprint 0, solid 0 (clean canvas awaiting user scroll)
  // drafting: blueprint 1, solid 0 (active CAD drafting)
  // building: blueprint fades from 1 -> 0, solid fades from 0 -> 1
  // solid: blueprint 0, solid 1 (permanent finished state)
  const blueprintOpacity = isDrafting ? 1 : isBuilding ? 0.25 : 0;
  const solidOpacity = isIdle || isDrafting ? 0 : 1;

  // 15 flutes per door
  const FLUTES_COUNT = 15;
  const flutes = Array.from({ length: FLUTES_COUNT });

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none overflow-visible ${className}`}
    >
      <style>{`
        @keyframes drawStrokeMainSlow {
          0% {
            stroke-dashoffset: 800;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes drawStrokePillarsSlow {
          0% {
            stroke-dashoffset: 500;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes drawStrokeSlatsSlow {
          0% {
            stroke-dashoffset: 400;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes pulseCrosshairSlow {
          0%, 100% { opacity: 0.95; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.92); }
        }
        .bp-stroke-main-slow {
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: drawStrokeMainSlow 2.2s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        .bp-stroke-pillars-slow {
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          animation: drawStrokePillarsSlow 2.1s cubic-bezier(0.25, 0.8, 0.25, 1) 0.3s forwards;
        }
        .bp-stroke-slats-slow {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: drawStrokeSlatsSlow 1.9s cubic-bezier(0.25, 0.8, 0.25, 1) 0.5s forwards;
        }
        .bp-crosshair-slow {
          transform-box: fill-box;
          transform-origin: center;
          animation: pulseCrosshairSlow 2.4s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 360 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[280px] sm:max-w-[330px] lg:max-w-[350px] overflow-visible"
        shapeRendering="geometricPrecision"
      >
        <defs>
          {/* Blueprint subtle glow */}
          <filter id="blueprintGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Brushed Brass Handle Gradient */}
          <linearGradient id="brassHandleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9a7428" />
            <stop offset="25%" stopColor="#dfba65" />
            <stop offset="50%" stopColor="#fff2be" />
            <stop offset="75%" stopColor="#d3a94e" />
            <stop offset="100%" stopColor="#815e1a" />
          </linearGradient>

          {/* Gate Vertical Fluted Slat Gradient (Specular Face Highlight) */}
          <linearGradient id="slatHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2e3037" />
            <stop offset="45%" stopColor="#1e2025" />
            <stop offset="85%" stopColor="#121316" />
            <stop offset="100%" stopColor="#0a0b0d" />
          </linearGradient>

          {/* Architectural Concrete / Slate Masonry Pillar Gradient */}
          <linearGradient id="pillarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#383b44" />
            <stop offset="20%" stopColor="#2c2e36" />
            <stop offset="70%" stopColor="#212329" />
            <stop offset="100%" stopColor="#16171b" />
          </linearGradient>

          {/* Overhead Pergola Canopy Metal Gradient */}
          <linearGradient id="canopyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2b2d35" />
            <stop offset="40%" stopColor="#1c1d22" />
            <stop offset="100%" stopColor="#0e0f12" />
          </linearGradient>

          {/* Ambient Ground Uplight Glow */}
          <radialGradient id="groundUplight" cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.09" />
            <stop offset="35%" stopColor="#d4af37" stopOpacity="0.04" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Flanking Outer Boundary Walls */}
          <linearGradient id="outerWallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d0e11" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1a1c22" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* ============================================================== */}
        {/* 1. SOLID ARCHITECTURAL GATE (Materializes in Stage 2)          */}
        {/* ============================================================== */}
        <g
          className="transition-opacity duration-[1600ms] ease-out"
          style={{ opacity: solidOpacity }}
        >
          {/* Ground Warm/White Uplight Glow at Gate Threshold */}
          <ellipse cx="180" cy="235" rx="145" ry="24" fill="url(#groundUplight)" />

          {/* Ground Paving Horizon & Architectural Score Lines */}
          <line x1="8" y1="235" x2="352" y2="235" stroke="#31343e" strokeWidth="1" />
          <line x1="36" y1="243" x2="324" y2="243" stroke="#1d1e24" strokeWidth="0.75" />

          {/* Flanking Outer Perimeter Walls */}
          <rect x="10" y="74" width="26" height="161" fill="url(#outerWallGrad)" />
          <line x1="10" y1="74" x2="36" y2="74" stroke="#252730" strokeWidth="0.75" />
          <rect x="324" y="74" width="26" height="161" fill="url(#outerWallGrad)" />
          <line x1="324" y1="74" x2="350" y2="74" stroke="#252730" strokeWidth="0.75" />

          {/* Left Masonry Pillar Post (Architectural Granite/Concrete) */}
          <g>
            <rect x="36" y="46" width="44" height="189" fill="url(#pillarGrad)" />
            {/* Masonry Block Joint Grooves */}
            <line x1="36" y1="94" x2="80" y2="94" stroke="#090a0c" strokeWidth="1.5" />
            <line x1="36" y1="141" x2="80" y2="141" stroke="#090a0c" strokeWidth="1.5" />
            <line x1="36" y1="188" x2="80" y2="188" stroke="#090a0c" strokeWidth="1.5" />
            {/* Subtle block seam bevel highlights */}
            <line x1="36" y1="95" x2="80" y2="95" stroke="#484b56" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="36" y1="142" x2="80" y2="142" stroke="#484b56" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="36" y1="189" x2="80" y2="189" stroke="#484b56" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* Pillar structural contours */}
            <line x1="36" y1="46" x2="80" y2="46" stroke="#525664" strokeWidth="0.75" />
            <line x1="36.5" y1="46" x2="36.5" y2="235" stroke="#434652" strokeWidth="0.75" />
            <line x1="79.5" y1="46" x2="79.5" y2="235" stroke="#090a0c" strokeWidth="1" />
          </g>

          {/* Right Masonry Pillar Post (Architectural Granite/Concrete) */}
          <g>
            <rect x="280" y="46" width="44" height="189" fill="url(#pillarGrad)" />
            {/* Masonry Block Joint Grooves */}
            <line x1="280" y1="94" x2="324" y2="94" stroke="#090a0c" strokeWidth="1.5" />
            <line x1="280" y1="141" x2="324" y2="141" stroke="#090a0c" strokeWidth="1.5" />
            <line x1="280" y1="188" x2="324" y2="188" stroke="#090a0c" strokeWidth="1.5" />
            {/* Subtle block seam bevel highlights */}
            <line x1="280" y1="95" x2="324" y2="95" stroke="#484b56" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="280" y1="142" x2="324" y2="142" stroke="#484b56" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="280" y1="189" x2="324" y2="189" stroke="#484b56" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* Pillar structural contours */}
            <line x1="280" y1="46" x2="324" y2="46" stroke="#525664" strokeWidth="0.75" />
            <line x1="280.5" y1="46" x2="280.5" y2="235" stroke="#434652" strokeWidth="0.75" />
            <line x1="323.5" y1="46" x2="323.5" y2="235" stroke="#090a0c" strokeWidth="1" />
          </g>

          {/* Overhead Pergola Canopy Structure */}
          <g>
            {/* Main horizontal cantilever frame */}
            <rect x="22" y="20" width="316" height="14" rx="1" fill="url(#canopyGrad)" stroke="#343740" strokeWidth="0.75" />
            {/* Pergola support brackets on pillar tops */}
            <rect x="28" y="34" width="52" height="12" fill="#141519" stroke="#2c2e36" strokeWidth="0.5" />
            <rect x="280" y="34" width="52" height="12" fill="#141519" stroke="#2c2e36" strokeWidth="0.5" />
            {/* Horizontal Pergola Cross-Slats */}
            <line x1="42" y1="23.5" x2="318" y2="23.5" stroke="#414450" strokeWidth="1.5" />
            <line x1="42" y1="26.5" x2="318" y2="26.5" stroke="#2b2d35" strokeWidth="1.5" />
            <line x1="42" y1="29.5" x2="318" y2="29.5" stroke="#3e414c" strokeWidth="1.5" />
            <line x1="42" y1="32.5" x2="318" y2="32.5" stroke="#23252c" strokeWidth="1.5" />
            <line x1="42" y1="37" x2="318" y2="37" stroke="#1c1d23" strokeWidth="2" />
            <line x1="42" y1="41" x2="318" y2="41" stroke="#14151a" strokeWidth="2" />
          </g>

          {/* ========================================================== */}
          {/* Main Double Gate (x=80 to x=280)                           */}
          {/* ========================================================== */}
          <g>
            {/* Gate Outer Perimeter Box & Threshold Frame */}
            <rect x="80" y="64" width="200" height="171" fill="#0c0d10" stroke="#282a32" strokeWidth="1" />

            {/* --- LEFT GATE PANEL (x=82 to 179) --- */}
            <g>
              <rect x="82" y="66" width="97" height="167" fill="#111215" stroke="#21232a" strokeWidth="0.75" />
              {/* Vertical Fluted Slat Ribs */}
              {flutes.map((_, i) => {
                const x = 84 + i * 6.2;
                return (
                  <g key={`l-flute-${i}`}>
                    <rect x={x} y={68} width={5.2} height={163} fill="url(#slatHighlight)" />
                    <line x1={x} y1={68} x2={x} y2={231} stroke="#32343d" strokeWidth="0.6" />
                    <line x1={x + 5.2} y1={68} x2={x + 5.2} y2={231} stroke="#070709" strokeWidth="0.8" />
                  </g>
                );
              })}
            </g>

            {/* --- RIGHT GATE PANEL (x=181 to 278) --- */}
            <g>
              <rect x="181" y="66" width="97" height="167" fill="#111215" stroke="#21232a" strokeWidth="0.75" />
              {/* Vertical Fluted Slat Ribs */}
              {flutes.map((_, i) => {
                const x = 183 + i * 6.2;
                return (
                  <g key={`r-flute-${i}`}>
                    <rect x={x} y={68} width={5.2} height={163} fill="url(#slatHighlight)" />
                    <line x1={x} y1={68} x2={x} y2={231} stroke="#32343d" strokeWidth="0.6" />
                    <line x1={x + 5.2} y1={68} x2={x + 5.2} y2={231} stroke="#070709" strokeWidth="0.8" />
                  </g>
                );
              })}
            </g>

            {/* Center Meeting Seam (Divider Gap between doors) */}
            <rect x="179" y="65" width="2" height="169" fill="#060608" />
            <line x1="179" y1="65" x2="179" y2="234" stroke="#2e3038" strokeWidth="0.5" />
            <line x1="181" y1="65" x2="181" y2="234" stroke="#2e3038" strokeWidth="0.5" />

            {/* --- LUXURY BRUSHED BRASS / CHAMPAGNE GOLD HANDLES --- */}
            {/* Left Pull Handle */}
            <g>
              <rect x="168" y="125" width="4" height="2" fill="#7d5d1c" />
              <rect x="168" y="181" width="4" height="2" fill="#7d5d1c" />
              <rect
                x="169"
                y="120"
                width="3.2"
                height="66"
                rx="1"
                fill="url(#brassHandleGrad)"
                stroke="#574011"
                strokeWidth="0.4"
              />
              {/* Specular Glint Highlight */}
              <line x1="170" y1="122" x2="170" y2="184" stroke="#fff" strokeWidth="0.65" strokeOpacity="0.85" />
              {/* Horizontal Latch Lever next to handle */}
              <rect x="156" y="152" width="10.5" height="2.5" rx="0.5" fill="url(#brassHandleGrad)" />
              <circle cx="165" cy="153.2" r="2.5" fill="#4d370e" />
            </g>

            {/* Right Pull Handle */}
            <g>
              <rect x="188" y="125" width="4" height="2" fill="#7d5d1c" />
              <rect x="188" y="181" width="4" height="2" fill="#7d5d1c" />
              <rect
                x="188"
                y="120"
                width="3.2"
                height="66"
                rx="1"
                fill="url(#brassHandleGrad)"
                stroke="#574011"
                strokeWidth="0.4"
              />
              {/* Specular Glint Highlight */}
              <line x1="189" y1="122" x2="189" y2="184" stroke="#fff" strokeWidth="0.65" strokeOpacity="0.85" />
            </g>
          </g>
        </g>

        {/* ============================================================== */}
        {/* 2. BLUEPRINT TECHNICAL DRAFTING OVERLAY (Animated on View)      */}
        {/* ============================================================== */}
        <g
          className="transition-opacity duration-[1200ms] ease-in-out pointer-events-none"
          style={{
            opacity: blueprintOpacity,
            filter: 'url(#blueprintGlow)'
          }}
        >
          {/* CAD Background Coordinate Grid */}
          <g stroke="#0ea5e9" strokeWidth="0.5" strokeOpacity="0.16" strokeDasharray="3 3">
            <line x1="16" y1="30" x2="344" y2="30" />
            <line x1="16" y1="94" x2="344" y2="94" />
            <line x1="16" y1="141" x2="344" y2="141" />
            <line x1="16" y1="188" x2="344" y2="188" />
            <line x1="16" y1="235" x2="344" y2="235" />
            <line x1="36" y1="12" x2="36" y2="245" />
            <line x1="80" y1="12" x2="80" y2="245" />
            <line x1="180" y1="12" x2="180" y2="245" />
            <line x1="280" y1="12" x2="280" y2="245" />
            <line x1="324" y1="12" x2="324" y2="245" />
          </g>

          {/* Blueprint Overhead Dimension Callout: ⟨ ARCH-GATE // 4.20m ⟩ */}
          <g>
            <line x1="22" y1="12" x2="338" y2="12" stroke="#38bdf8" strokeWidth="0.75" />
            <line x1="22" y1="8" x2="22" y2="16" stroke="#38bdf8" strokeWidth="0.75" />
            <line x1="338" y1="8" x2="338" y2="16" stroke="#38bdf8" strokeWidth="0.75" />
            <text
              x="180"
              y="10"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="7"
              fontFamily="monospace"
              letterSpacing="1"
            >
              ⟨ ARCH-GATE // 4.20m ⟩
            </text>
          </g>

          {/* Blueprint Left Height Dimension Callout: H: 3.40m */}
          <g>
            <line x1="14" y1="20" x2="14" y2="235" stroke="#38bdf8" strokeWidth="0.75" />
            <line x1="10" y1="20" x2="18" y2="20" stroke="#38bdf8" strokeWidth="0.75" />
            <line x1="10" y1="235" x2="18" y2="235" stroke="#38bdf8" strokeWidth="0.75" />
            <text
              x="12"
              y="130"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="6"
              fontFamily="monospace"
              transform="rotate(-90 12 130)"
              letterSpacing="1"
            >
              H: 3.40m
            </text>
          </g>

          {/* Technical Alignment Crosshairs (+) at key junctions */}
          {[
            [36, 46],
            [80, 46],
            [280, 46],
            [324, 46],
            [36, 235],
            [80, 235],
            [280, 235],
            [324, 235],
            [180, 64],
            [180, 235],
            [170, 153],
            [190, 153]
          ].map(([cx, cy], idx) => (
            <g key={`crosshair-${idx}`} stroke="#38bdf8" strokeWidth="0.8" className="bp-crosshair-slow">
              <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} />
              <line x1={cx} y1={cy - 3} x2={cx + 3} y2={cy + 3} />
            </g>
          ))}

          {/* Wireframe Laser Drafting Strokes (Slow CAD Animation) */}
          {/* Canopy Outline */}
          <rect
            x="22"
            y="20"
            width="316"
            height="14"
            stroke="#38bdf8"
            strokeWidth="1.25"
            fill="none"
            className={isDrafting ? 'bp-stroke-main-slow' : isBuilding || isSolid ? '' : 'opacity-0'}
          />
          {/* Pergola cross slats */}
          {[23.5, 26.5, 29.5, 32.5, 37].map((sy, i) => (
            <line
              key={`draft-slat-${i}`}
              x1="42"
              y1={sy}
              x2="318"
              y2={sy}
              stroke="#0ea5e9"
              strokeWidth="0.8"
              strokeDasharray="4 2"
            />
          ))}

          {/* Left Pillar Wireframe */}
          <rect
            x="36"
            y="46"
            width="44"
            height="189"
            stroke="#38bdf8"
            strokeWidth="1.25"
            fill="none"
            className={isDrafting ? 'bp-stroke-pillars-slow' : isBuilding || isSolid ? '' : 'opacity-0'}
          />
          <line x1="36" y1="94" x2="80" y2="94" stroke="#38bdf8" strokeWidth="0.75" />
          <line x1="36" y1="141" x2="80" y2="141" stroke="#38bdf8" strokeWidth="0.75" />
          <line x1="36" y1="188" x2="80" y2="188" stroke="#38bdf8" strokeWidth="0.75" />

          {/* Right Pillar Wireframe */}
          <rect
            x="280"
            y="46"
            width="44"
            height="189"
            stroke="#38bdf8"
            strokeWidth="1.25"
            fill="none"
            className={isDrafting ? 'bp-stroke-pillars-slow' : isBuilding || isSolid ? '' : 'opacity-0'}
          />
          <line x1="280" y1="94" x2="324" y2="94" stroke="#38bdf8" strokeWidth="0.75" />
          <line x1="280" y1="141" x2="324" y2="141" stroke="#38bdf8" strokeWidth="0.75" />
          <line x1="280" y1="188" x2="324" y2="188" stroke="#38bdf8" strokeWidth="0.75" />

          {/* Gate Outer Framing Wireframe */}
          <rect
            x="80"
            y="64"
            width="200"
            height="171"
            stroke="#38bdf8"
            strokeWidth="1.25"
            fill="none"
            className={isDrafting ? 'bp-stroke-main-slow' : isBuilding || isSolid ? '' : 'opacity-0'}
          />

          {/* Center Seam Wireframe */}
          <line
            x1="180"
            y1="64"
            x2="180"
            y2="235"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="6 3"
          />

          {/* Fluted Wireframe Lines */}
          {flutes.map((_, i) => {
            const xl = 84 + i * 6.2;
            const xr = 183 + i * 6.2;
            return (
              <g key={`draft-ribs-${i}`}>
                <line
                  x1={xl}
                  y1="68"
                  x2={xl}
                  y2="231"
                  stroke="#38bdf8"
                  strokeWidth="0.5"
                  strokeOpacity="0.55"
                  className={isDrafting ? 'bp-stroke-slats-slow' : isBuilding || isSolid ? '' : 'opacity-0'}
                />
                <line
                  x1={xr}
                  y1="68"
                  x2={xr}
                  y2="231"
                  stroke="#38bdf8"
                  strokeWidth="0.5"
                  strokeOpacity="0.55"
                  className={isDrafting ? 'bp-stroke-slats-slow' : isBuilding || isSolid ? '' : 'opacity-0'}
                />
              </g>
            );
          })}

          {/* Handles Wireframe */}
          <rect x="169" y="120" width="3.2" height="66" rx="1" stroke="#38bdf8" strokeWidth="1" fill="none" />
          <rect x="188" y="120" width="3.2" height="66" rx="1" stroke="#38bdf8" strokeWidth="1" fill="none" />
          <line x1="156" y1="153.2" x2="166" y2="153.2" stroke="#38bdf8" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}

export default BlueprintGate;
