import React from 'react';

/**
 * IsometricFilter Component
  * Precision axonometric laminar filtration funnel.
   * Represents "Friction to bots, not on users".
    * Pure minimal silhouette: clean flared outer contours, refined dual-lip top rim,
     * subtle translucent glass body, and clean grounded spout with zero interior clutter.
      */
export function IsometricFilter({ className = 'w-full h-72' }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="70 34 160 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        shapeRendering="geometricPrecision"
      >
        <defs>
          {/* Soft Ground Shadow Fade */}
          <radialGradient id="filterGroundSoft" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>

          {/* Smooth Glass Sheen (1-3% opacity) */}
          <linearGradient id="funnelSheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.035" />
            <stop offset="35%" stopColor="#fff" stopOpacity="0.01" />
            <stop offset="70%" stopColor="#fff" stopOpacity="0.012" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.03" />
          </linearGradient>

          {/* Vertical Body Stroke Gradient */}
          <linearGradient id="funnelStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.32" />
          </linearGradient>
        </defs>

        {/* 1. Ground Shadow (Stationary, anchored under spout) */}
        <ellipse cx="150" cy="224" rx="42" ry="10" fill="url(#filterGroundSoft)" />

        {/* 2. Bottom Spout / Outlet Stem */}
        {/* Spout Side Walls */}
        <line
          x1="138"
          y1="170"
          x2="138"
          y2="204"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <line
          x1="162"
          y1="170"
          x2="162"
          y2="204"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* Spout Bottom Outlet Ring */}
        <ellipse
          cx="150"
          cy="204"
          rx="12"
          ry="4"
          fill="rgba(0, 0, 0, 0.45)"
          stroke="rgba(255, 255, 255, 0.32)"
          strokeWidth="0.8"
        />

        {/* Neck Junction Ring (where cone joins spout) */}
        <ellipse
          cx="150"
          cy="170"
          rx="12"
          ry="3.8"
          fill="rgba(255, 255, 255, 0.02)"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="0.75"
        />

        {/* 3. Flared Funnel Body (Smooth continuous bezier contours) */}
        {/* Funnel Body Translucent Glass Sheen Fill */}
        <path
          d="M 86 56 C 86 105 136 135 138 170 L 162 170 C 164 135 214 105 214 56 Z"
          fill="url(#funnelSheen)"
        />

        {/* Smooth Left Flared Contour */}
        <path
          d="M 86 56 C 86 105 136 135 138 170"
          stroke="url(#funnelStroke)"
          strokeWidth="0.85"
          strokeLinecap="round"
        />

        {/* Smooth Right Flared Contour */}
        <path
          d="M 214 56 C 214 105 164 135 162 170"
          stroke="url(#funnelStroke)"
          strokeWidth="0.85"
          strokeLinecap="round"
        />

        {/* 4. Top Refined Dual-Lip Intake Rim */}
        {/* Outer Ellipse */}
        <ellipse
          cx="150"
          cy="56"
          rx="64"
          ry="18"
          fill="rgba(255, 255, 255, 0.02)"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="0.85"
        />

        {/* Outer Lip Collar Thickness */}
        <path
          d="M 86 56 A 64 18 0 0 0 214 56 L 214 62 A 64 18 0 0 1 86 62 Z"
          fill="rgba(255, 255, 255, 0.03)"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Inner Intake Aperture Opening */}
        <ellipse
          cx="150"
          cy="56"
          rx="52"
          ry="14.5"
          fill="rgba(0, 0, 0, 0.35)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="0.75"
        />
      </svg>
    </div>
  );
}

export default IsometricFilter;
