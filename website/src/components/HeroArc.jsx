import React from 'react';

/**
 * HeroArc Component
 * Upward-facing circular cradle arc spanning from top-left, curving below the buttons,
 * and exiting at top-right. Uses preserveAspectRatio="xMidYMid slice" to scale and center
 * smoothly across both mobile and desktop viewports with a single hardware-accelerated SVG.
 */
export function HeroArc() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* TV Static Noise Texture Overlay - 100% GPU hardware accelerated, 0ms CPU time */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-screen z-10"
        style={{
          backgroundImage: "url('/noise.png')",
          backgroundRepeat: 'repeat'
        }}
      />

      <svg
        aria-hidden="true"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <clipPath id="insideBowlClip">
            <path d="M -20,0 L 1940,0 L 1940,20 A 1040 1040 0 0,1 -20,20 Z" />
          </clipPath>

          <linearGradient id="cradleGlowLinear" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="78%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.26" />
          </linearGradient>

          <radialGradient
            id="cradleGlowRadial"
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

          <linearGradient id="arcStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <g clipPath="url(#insideBowlClip)" className="animate-inner-glow">
          <rect
            x="0"
            y="0"
            width="1920"
            height="1080"
            fill="url(#cradleGlowLinear)"
          />
          <rect
            x="0"
            y="0"
            width="1920"
            height="1080"
            fill="url(#cradleGlowRadial)"
          />
        </g>

        {/* Refined crisp tracer arc with subtle natural luminance */}
        <path
          d="M -20,20 A 1040 1040 0 0,0 1940,20"
          pathLength="100"
          stroke="url(#arcStrokeGradient)"
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
