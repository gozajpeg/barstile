import React from 'react';

/**
 * FooterWave Component
 * A single, static razor-sharp fluid ocean wave framing the CTA and Footer.
 * Features:
 * - Single, ultra-clean 1.25px tracer line (strictly NO double-lining).
 * - Sized large so the entire CTA and Footer are enveloped INSIDE the wave.
 * - Static rendering matching HeroArc (always visible, zero scroll overhead).
 * - Ambient glow radiating from floor upwards into the wave crest.
 */
export function FooterWave() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* ============================================================== */}
      {/* 1. DESKTOP SVG (Single sweeping fluid wave line, glow from below)*/}
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
          {/* Clip path covering everything BELOW the fluid wave line, enveloping CTA & Footer */}
          <clipPath id="fluidWaveUnderClipDesktop">
            <path d="M -40 520 C 340 600, 700 280, 1060 260 C 1420 240, 1700 440, 1960 360 L 1960 1100 L -40 1100 Z" />
          </clipPath>

          {/* Upward Linear Ambient Glow (Radiating from floor upwards into wave dome) */}
          <linearGradient id="fluidGlowLinearDesktop" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="16%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="88%" stopColor="#ffffff" stopOpacity="0.01" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Upward Radial Glow centered in the lower-mid interior */}
          <radialGradient
            id="fluidGlowRadialDesktop"
            cx="1000"
            cy="880"
            r="1200"
            fx="1000"
            fy="880"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(1 0 0 0.60 0 352)"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="65%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.01" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Subtle noise grain filter matching HeroArc texture */}
          <filter id="fluidGlowGrainDesktop" x="0%" y="0%" width="100%" height="100%">
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

          {/* Single wave luminous stroke gradient */}
          <linearGradient id="fluidWaveStrokeDesktop" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Ambient Glow filling the wave interior */}
        <g clipPath="url(#fluidWaveUnderClipDesktop)">
          <g filter="url(#fluidGlowGrainDesktop)">
            <rect
              x="0"
              y="0"
              width="1920"
              height="1080"
              fill="url(#fluidGlowLinearDesktop)"
            />
            <rect
              x="0"
              y="0"
              width="1920"
              height="1080"
              fill="url(#fluidGlowRadialDesktop)"
            />
          </g>
        </g>

        {/* SINGLE static fluid ocean wave line */}
        <path
          d="M -40 520 C 340 600, 700 280, 1060 260 C 1420 240, 1700 440, 1960 360"
          stroke="url(#fluidWaveStrokeDesktop)"
          strokeWidth="1.25"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 3.5px rgba(255, 255, 255, 0.45))'
          }}
        />
      </svg>

      {/* ============================================================== */}
      {/* 2. MOBILE SVG (Single fluid wave line for narrow screens)       */}
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
          <clipPath id="fluidWaveUnderClipMobile">
            <path d="M -40 520 C 340 600, 700 280, 1060 260 C 1420 240, 1700 440, 1960 360 L 1960 1100 L -40 1100 Z" />
          </clipPath>

          {/* Upward Linear Ambient Glow (Radiating from floor upwards into wave dome) */}
          <linearGradient id="fluidGlowLinearMobile" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="16%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="88%" stopColor="#ffffff" stopOpacity="0.01" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Upward Radial Glow centered in the lower-mid interior */}
          <radialGradient
            id="fluidGlowRadialMobile"
            cx="1000"
            cy="880"
            r="1200"
            fx="1000"
            fy="880"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(1 0 0 0.60 0 352)"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="65%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.01" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <filter id="fluidGlowGrainMobile" x="0%" y="0%" width="100%" height="100%">
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

          <linearGradient id="fluidWaveStrokeMobile" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <g clipPath="url(#fluidWaveUnderClipMobile)">
          <g filter="url(#fluidGlowGrainMobile)">
            <rect
              x="0"
              y="0"
              width="1920"
              height="1080"
              fill="url(#fluidGlowLinearMobile)"
            />
            <rect
              x="0"
              y="0"
              width="1920"
              height="1080"
              fill="url(#fluidGlowRadialMobile)"
            />
          </g>
        </g>

        <path
          d="M -40 520 C 340 600, 700 280, 1060 260 C 1420 240, 1700 440, 1960 360"
          stroke="url(#fluidWaveStrokeMobile)"
          strokeWidth="1.25"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 3.5px rgba(255, 255, 255, 0.45))'
          }}
        />
      </svg>
    </div>
  );
}

export default FooterWave;
