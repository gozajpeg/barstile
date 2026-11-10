import React from 'react';

/**
 * HeroArc Component
 * Upward-facing circular cradle arc spanning from top-left, curving below the buttons,
 * and exiting at top-right.
 * Features:
 * - Desktop: Exact untouched desktop geometry with preserveAspectRatio="none",
 *   spanning from screen edges cleanly across the desktop viewport.
 * - Mobile: Dedicated mobile viewport handling with preserveAspectRatio="xMidYMid slice",
 *   ensuring the circle maintains its true circular arc and wide glow without being
 *   squished into a narrow cone, overlapping off-screen naturally.
 */
export function HeroArc() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* ============================================================== */}
      {/* 1. DESKTOP SVG (Exact original approved desktop geometry)       */}
      {/* ============================================================== */}
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden md:block w-full h-full overflow-visible"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <clipPath id="insideBowlClipDesktop">
            <path d="M -20,0 L 1940,0 L 1940,20 A 1040 1040 0 0,1 -20,20 Z" />
          </clipPath>

          <linearGradient id="cradleGlowLinearDesktop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="78%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.26" />
          </linearGradient>

          <radialGradient
            id="cradleGlowRadialDesktop"
            cx="960"
            cy="680"
            r="1100"
            fx="960"
            fy="680"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(1 0 0 0.50 0 340)"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.30" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <filter id="cradleGlowWithGrainDesktop" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="3"
              stitchTiles="stitch"
              result="rawNoise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1
                      0 0 0 0 1
                      0 0 0 0 1
                      0 0 0 0.16 0"
              result="whiteGrain"
            />
            <feComposite
              in="whiteGrain"
              in2="SourceGraphic"
              operator="in"
              result="maskedGrain"
            />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="maskedGrain" />
            </feMerge>
          </filter>

          <linearGradient id="arcStrokeGradientDesktop" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <g clipPath="url(#insideBowlClipDesktop)" className="animate-inner-glow">
          <g filter="url(#cradleGlowWithGrainDesktop)">
            <rect
              x="0"
              y="0"
              width="1920"
              height="1080"
              fill="url(#cradleGlowLinearDesktop)"
            />
            <rect
              x="0"
              y="0"
              width="1920"
              height="1080"
              fill="url(#cradleGlowRadialDesktop)"
            />
          </g>
        </g>

        {/* Refined crisp tracer arc with subtle natural luminance */}
        <path
          d="M -20,20 A 1040 1040 0 0,0 1940,20"
          pathLength="100"
          stroke="url(#arcStrokeGradientDesktop)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeDasharray="100"
          strokeDashoffset="100"
          className="animate-draw-arc"
          style={{ opacity: 0 }}
        />
      </svg>

      {/* ============================================================== */}
      {/* 2. MOBILE SVG (True un-squished circular arc, overlaps edges)   */}
      {/* ============================================================== */}
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block md:hidden w-full h-full overflow-visible"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <clipPath id="insideBowlClipMobile">
            <path d="M -20,0 L 1940,0 L 1940,20 A 1040 1040 0 0,1 -20,20 Z" />
          </clipPath>

          <linearGradient id="cradleGlowLinearMobile" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="78%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.26" />
          </linearGradient>

          <radialGradient
            id="cradleGlowRadialMobile"
            cx="960"
            cy="680"
            r="1100"
            fx="960"
            fy="680"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(1 0 0 0.50 0 340)"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.30" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <filter id="cradleGlowWithGrainMobile" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="3"
              stitchTiles="stitch"
              result="rawNoise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1
                      0 0 0 0 1
                      0 0 0 0 1
                      0 0 0 0.16 0"
              result="whiteGrain"
            />
            <feComposite
              in="whiteGrain"
              in2="SourceGraphic"
              operator="in"
              result="maskedGrain"
            />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="maskedGrain" />
            </feMerge>
          </filter>

          <linearGradient id="arcStrokeGradientMobile" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <g clipPath="url(#insideBowlClipMobile)" className="animate-inner-glow">
          <g filter="url(#cradleGlowWithGrainMobile)">
            <rect
              x="0"
              y="0"
              width="1920"
              height="1080"
              fill="url(#cradleGlowLinearMobile)"
            />
            <rect
              x="0"
              y="0"
              width="1920"
              height="1080"
              fill="url(#cradleGlowRadialMobile)"
            />
          </g>
        </g>

        {/* Refined crisp tracer arc with subtle natural luminance */}
        <path
          d="M -20,20 A 1040 1040 0 0,0 1940,20"
          pathLength="100"
          stroke="url(#arcStrokeGradientMobile)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeDasharray="100"
          strokeDashoffset="100"
          className="animate-draw-arc"
          style={{ opacity: 0 }}
        />
      </svg>
    </div>
  );
}

export default HeroArc;
