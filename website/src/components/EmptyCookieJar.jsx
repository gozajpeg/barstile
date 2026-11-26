import React from 'react';

/**
 * EmptyCookieJar Component
 * Modeled directly after the user's reference photo:
 * - 3/4 perspective: jar resting on its side on the right side of the card
 * - Wide open threaded glass mouth facing forward/down-left toward the viewer
 * - Body receding upward-right into the background
 * - Thick braided jute twine tied around the neck collar with knot & bow
 * - Rich glass volume with specular reflections, glass thickness, and molded base
 * - Completely, cleanly empty inside: "Zero cookies. Not even the crumbs."
 */
export function EmptyCookieJar({ className = '' }) {
  return (
    <div className={`relative w-full h-full flex items-center justify-end select-none pointer-events-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 380 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-[380px] overflow-visible"
        shapeRendering="geometricPrecision"
      >
        <defs>
          {/* Ground Contact Shadow */}
          <radialGradient id="jarFloorShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Deep Translucent Glass Body Volume */}
          <linearGradient id="jarGlassVolume" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c3342" stopOpacity="0.5" />
            <stop offset="20%" stopColor="#181e2a" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#0e121a" stopOpacity="0.2" />
            <stop offset="80%" stopColor="#1a202c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2f3747" stopOpacity="0.65" />
          </linearGradient>

          {/* Interior Cavity (Deep dark spotless void seen through the mouth) */}
          <radialGradient id="jarInteriorVoid" cx="45%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#111622" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#080b10" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020305" stopOpacity="1" />
          </radialGradient>

          {/* Top Edge Specular Glint */}
          <linearGradient id="jarTopGlint" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#cbd5e1" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
          </linearGradient>

          {/* Bottom Edge Bounce Reflection */}
          <linearGradient id="jarBottomGlint" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="40%" stopColor="#93c5fd" stopOpacity="0.6" />
            <stop offset="75%" stopColor="#e2e8f0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
          </linearGradient>

          {/* Heavy Glass Rim Ring */}
          <linearGradient id="jarMouthRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#cbd5e1" stopOpacity="0.7" />
            <stop offset="55%" stopColor="#64748b" stopOpacity="0.5" />
            <stop offset="85%" stopColor="#e2e8f0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          {/* Twine Fiber Gradient */}
          <linearGradient id="twineFiber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5d094" />
            <stop offset="30%" stopColor="#c8924b" />
            <stop offset="70%" stopColor="#96612d" />
            <stop offset="100%" stopColor="#5c3814" />
          </linearGradient>
        </defs>

        {/* 1. GROUND CONTACT SHADOW */}
        <ellipse cx="260" cy="188" rx="85" ry="18" fill="url(#jarFloorShadow)" />
        <ellipse cx="235" cy="182" rx="55" ry="12" fill="#000000" fillOpacity="0.7" />

        {/* 2. JAR MAIN 3D PERSPECTIVE GROUP */}
        {/* Tilted on its side: mouth forward-left, body receding up-right */}
        <g transform="translate(225, 125) rotate(-22)">

          {/* A. REAR INTERIOR CAVITY (Visible straight down the mouth) */}
          <path
            d="M 12 -46
               C 50 -55, 110 -55, 140 -48
               C 162 -24, 162 24, 140 48
               C 110 55, 50 55, 12 46
               Z"
            fill="url(#jarInteriorVoid)"
          />

          {/* Rear inner bottom base curve */}
          <path
            d="M 136 -44 C 150 -20, 150 20, 136 44"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.2"
            strokeDasharray="3 3"
          />

          {/* B. GLASS JAR BODY (Outer transparent curved shell) */}
          <path
            d="M 8 -42
               C 22 -48, 38 -56, 55 -58
               L 135 -56
               C 158 -54, 168 -36, 168 0
               C 168 36, 158 54, 135 56
               L 55 58
               C 38 56, 22 48, 8 42
               Z"
            fill="url(#jarGlassVolume)"
            stroke="#475569"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* C. THICK MOLDED GLASS BASE (Far right rounded end) */}
          <path
            d="M 135 -56 C 168 -36, 168 36, 135 56"
            stroke="#ffffff"
            strokeWidth="2"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />
          {/* Base inner punt ring */}
          <path
            d="M 144 -42 C 160 -24, 160 24, 144 42"
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />
          {/* Specular base arc highlight */}
          <path
            d="M 158 -22 C 164 -8, 164 8, 158 22"
            stroke="#ffffff"
            strokeWidth="2"
            strokeOpacity="0.9"
            strokeLinecap="round"
          />

          {/* D. BODY SPECULAR REFLECTION LINES (Running along cylinder) */}
          {/* Upper sharp glint line */}
          <path
            d="M 28 -50 L 138 -52"
            stroke="url(#jarTopGlint)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Secondary softer upper streak */}
          <path
            d="M 38 -42 L 130 -44"
            stroke="#ffffff"
            strokeWidth="1"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          {/* Lower table bounce glint line */}
          <path
            d="M 26 50 L 136 50"
            stroke="url(#jarBottomGlint)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Secondary bottom streak */}
          <path
            d="M 36 42 L 126 42"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />

          {/* E. SCREW-THREADED GLASS NECK */}
          {/* Thread ridge 1 */}
          <path
            d="M -4 -43 C 2 -43, 6 -35, 6 0 C 6 35, 2 43, -4 43"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeOpacity="0.5"
            fill="none"
          />
          {/* Thread ridge 2 */}
          <path
            d="M 3 -45 C 9 -45, 14 -38, 14 0 C 14 38, 9 45, 3 45"
            stroke="#cbd5e1"
            strokeWidth="1.3"
            strokeOpacity="0.4"
            fill="none"
          />

          {/* F. THICK JUTE TWINE TIED AROUND THE NECK (from photo) */}
          {/* Twine Wrap 1 */}
          <path
            d="M 12 -44 C 18 -43, 24 -36, 24 0 C 24 36, 18 43, 12 44"
            stroke="url(#twineFiber)"
            strokeWidth="3.5"
            fill="none"
          />
          {/* Twine Wrap 2 */}
          <path
            d="M 16 -45 C 22 -44, 28 -37, 28 0 C 28 37, 22 44, 16 45"
            stroke="url(#twineFiber)"
            strokeWidth="3.2"
            fill="none"
          />
          {/* Fiber twist texture */}
          <path
            d="M 14 -44 C 20 -43, 26 -36, 26 0 C 26 36, 20 43, 14 44"
            stroke="#fed7aa"
            strokeWidth="0.8"
            strokeOpacity="0.6"
            strokeDasharray="2 2"
            fill="none"
          />

          {/* Twine Bow & Knot (Resting on top shoulder of neck) */}
          {/* Knot core */}
          <circle cx="14" cy="-44" r="4.5" fill="#a16207" stroke="#713f12" strokeWidth="0.8" />
          <circle cx="15" cy="-45" r="2.8" fill="#ca8a04" />
          {/* Left bow loop */}
          <path
            d="M 14 -44 C 2 -58, -6 -48, 11 -43"
            stroke="url(#twineFiber)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Right bow loop */}
          <path
            d="M 15 -44 C 28 -60, 38 -50, 18 -42"
            stroke="url(#twineFiber)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Loose twine cord end 1 (draped down) */}
          <path
            d="M 14 -42 C 8 -28, 2 -18, -4 -15"
            stroke="url(#twineFiber)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Loose twine cord end 2 */}
          <path
            d="M 16 -42 C 20 -26, 24 -12, 19 -4"
            stroke="url(#twineFiber)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* G. WIDE OPEN GLASS MOUTH & RIM (Facing viewer / foreground) */}
          {/* Outer Glass Lip Bevel */}
          <ellipse
            cx="-12"
            cy="0"
            rx="14"
            ry="48"
            stroke="url(#jarMouthRim)"
            strokeWidth="3"
            fill="none"
          />
          {/* Inner Lip Glass Thickness Ring */}
          <ellipse
            cx="-10"
            cy="0"
            rx="9"
            ry="44"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeOpacity="0.75"
            fill="none"
          />
          {/* Pure Void Opening (View straight into empty interior) */}
          <ellipse
            cx="-8"
            cy="0"
            rx="6.5"
            ry="41"
            stroke="#475569"
            strokeWidth="0.8"
            strokeOpacity="0.4"
            fill="none"
          />

          {/* Rim Specular Glints (Catching light on front lip) */}
          {/* Top bright glint */}
          <path
            d="M -14 -42 C -7 -28, -7 -10, -10 2"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeOpacity="0.95"
            strokeLinecap="round"
          />
          {/* Bottom bounce glint */}
          <path
            d="M -10 15 C -7 28, -7 38, -14 44"
            stroke="#ffffff"
            strokeWidth="2"
            strokeOpacity="0.85"
            strokeLinecap="round"
          />
          {/* Sharp lip edge glint */}
          <path
            d="M -24 -18 C -26 -4, -26 12, -24 24"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeOpacity="0.9"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

export default EmptyCookieJar;
