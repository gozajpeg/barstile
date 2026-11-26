import React from 'react';

/**
 * EmptyCookieJar Component
 * Straight 1:1 copy of the reference photo, mirrored to sit on the right side:
 * - Squat, round, bulbous glass cookie jar resting on its side
 * - Large, prominent circular threaded glass mouth facing forward/down-left
 * - Thick glass lip with 3 raised screw threads around the rim
 * - Rustic frayed jute twine wrapped around the neck with a prominent bow on top
 * - Bulbous curved glass body with realistic specular highlights and molded base
 * - Completely empty inside: "Zero cookies. Not even the crumbs."
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
            <stop offset="0%" stopColor="#000000" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#000000" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Bulbous Glass Body Volume Gradient */}
          <radialGradient id="bulbousGlass" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#333b4d" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#1e2430" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#10141c" stopOpacity="0.25" />
            <stop offset="95%" stopColor="#1c222e" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2e3849" stopOpacity="0.75" />
          </radialGradient>

          {/* Deep Dark Empty Interior */}
          <radialGradient id="deepInterior" cx="40%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#141822" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#090c12" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#020305" stopOpacity="1" />
          </radialGradient>

          {/* Glass Rim Glint Gradient */}
          <linearGradient id="rimGlint" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor="#cbd5e1" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#64748b" stopOpacity="0.5" />
            <stop offset="75%" stopColor="#e2e8f0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          {/* Upper Body Specular Highlight */}
          <linearGradient id="shoulderGlint" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>

          {/* Jute Twine Rope Gradient */}
          <linearGradient id="juteTwine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f6d396" />
            <stop offset="30%" stopColor="#c8934c" />
            <stop offset="65%" stopColor="#925e2b" />
            <stop offset="100%" stopColor="#553412" />
          </linearGradient>
        </defs>

        {/* 1. GROUND CONTACT SHADOW */}
        <ellipse cx="265" cy="188" rx="82" ry="18" fill="url(#jarFloorShadow)" />
        <ellipse cx="240" cy="182" rx="55" ry="12" fill="#000000" fillOpacity="0.75" />

        {/* 2. SQUAT BULBOUS JAR GROUP: Tilted on its side on the right */}
        {/* Facing forward-left with wide open mouth like the photo */}
        <g transform="translate(230, 122) rotate(-20)">

          {/* A. REAR INTERIOR CAVITY (Seen looking into the open mouth) */}
          <path
            d="M 10 -48
               C 38 -64, 75 -66, 102 -54
               C 126 -32, 126 32, 102 54
               C 75 66, 38 64, 10 48
               Z"
            fill="url(#deepInterior)"
          />

          {/* Rounded inner rear base of the squat jar */}
          <path
            d="M 98 -46 C 114 -24, 114 24, 98 46"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.2"
            strokeDasharray="3 3"
          />

          {/* B. BULBOUS GLASS BODY (Short, wide, round jar shell) */}
          <path
            d="M 8 -44
               C 18 -55, 34 -68, 58 -70
               C 85 -72, 110 -64, 124 -45
               C 138 -25, 138 25, 124 45
               C 110 64, 85 72, 58 70
               C 34 68, 18 55, 8 44
               Z"
            fill="url(#bulbousGlass)"
            stroke="#475569"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />

          {/* C. MOLDED SQUAT BASE (Rear right curve) */}
          <path
            d="M 102 -54 C 132 -32, 132 32, 102 54"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeOpacity="0.75"
            strokeLinecap="round"
          />
          {/* Base outer contour reflection */}
          <path
            d="M 112 -38 C 126 -20, 126 20, 112 38"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeOpacity="0.45"
            strokeLinecap="round"
          />

          {/* D. BULBOUS SHOULDER SPECULAR HIGHLIGHTS */}
          {/* Broad curved top reflection across the bulbous curve */}
          <path
            d="M 24 -56 C 50 -68, 85 -66, 112 -48"
            stroke="url(#shoulderGlint)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Secondary top glint arc */}
          <path
            d="M 32 -48 C 55 -58, 85 -56, 105 -40"
            stroke="#ffffff"
            strokeWidth="1"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          {/* Lower table bounce glint along the bottom curve */}
          <path
            d="M 22 56 C 50 68, 85 66, 112 48"
            stroke="#ffffff"
            strokeWidth="2"
            strokeOpacity="0.5"
            strokeLinecap="round"
          />
          {/* Secondary lower reflection */}
          <path
            d="M 32 48 C 55 58, 85 56, 105 40"
            stroke="#93c5fd"
            strokeWidth="1"
            strokeOpacity="0.4"
            strokeLinecap="round"
          />

          {/* E. THREADED GLASS NECK (3 distinct raised glass threads like photo) */}
          {/* Thread Ridge 1 (Closest to body) */}
          <path
            d="M 6 -46 C 14 -44, 20 -35, 20 0 C 20 35, 14 44, 6 46"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeOpacity="0.6"
            fill="none"
          />
          {/* Thread Ridge 2 (Middle) */}
          <path
            d="M 0 -45 C 8 -43, 14 -34, 14 0 C 14 34, 8 43, 0 45"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeOpacity="0.5"
            fill="none"
          />
          {/* Thread Ridge 3 (Near rim) */}
          <path
            d="M -6 -44 C 2 -42, 8 -33, 8 0 C 8 33, 2 42, -6 44"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeOpacity="0.65"
            fill="none"
          />

          {/* F. THICK JUTE TWINE CORD WRAPPED AROUND NECK WITH BIG FRAYED BOW */}
          {/* Cord wrapping pass 1 */}
          <path
            d="M 8 -46 C 16 -44, 22 -35, 22 0 C 22 35, 16 44, 8 46"
            stroke="url(#juteTwine)"
            strokeWidth="4"
            fill="none"
          />
          {/* Cord wrapping pass 2 */}
          <path
            d="M 12 -47 C 20 -45, 26 -36, 26 0 C 26 36, 20 45, 12 47"
            stroke="url(#juteTwine)"
            strokeWidth="3.6"
            fill="none"
          />
          {/* Twisted twine fiber highlights */}
          <path
            d="M 10 -46 C 18 -44, 24 -35, 24 0 C 24 35, 18 44, 10 46"
            stroke="#fde68a"
            strokeWidth="1"
            strokeOpacity="0.75"
            strokeDasharray="2 2"
            fill="none"
          />

          {/* Big Rustic Twine Bow (Resting right on the upper rim of neck like photo) */}
          {/* Center Knot Bundle */}
          <circle cx="10" cy="-46" r="5.5" fill="#a16207" stroke="#713f12" strokeWidth="1" />
          <circle cx="11" cy="-47" r="3.5" fill="#ca8a04" />
          {/* Left Large Bow Loop */}
          <path
            d="M 10 -46 C -6 -66, -14 -52, 6 -44"
            stroke="url(#juteTwine)"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 9 -46 C -4 -64, -12 -50, 5 -44"
            stroke="#fde68a"
            strokeWidth="0.8"
            strokeOpacity="0.7"
            fill="none"
          />
          {/* Right Large Bow Loop */}
          <path
            d="M 11 -46 C 28 -68, 40 -54, 15 -43"
            stroke="url(#juteTwine)"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 12 -46 C 26 -66, 38 -52, 16 -43"
            stroke="#fde68a"
            strokeWidth="0.8"
            strokeOpacity="0.7"
            fill="none"
          />
          {/* Frayed Trailing Cord End 1 (Draping down across the glass neck) */}
          <path
            d="M 9 -44 C 2 -26, -4 -12, -10 -8 C -14 -6, -18 -8, -22 -4"
            stroke="url(#juteTwine)"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Frayed Trailing Cord End 2 (Curving down) */}
          <path
            d="M 12 -43 C 18 -28, 22 -14, 16 -2"
            stroke="url(#juteTwine)"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* G. PROMINENT OPEN GLASS MOUTH & RIM (Wide circular opening facing viewer) */}
          {/* Outer Molded Glass Lip Bevel */}
          <ellipse
            cx="-14"
            cy="0"
            rx="18"
            ry="50"
            stroke="url(#rimGlint)"
            strokeWidth="3.2"
            fill="none"
          />
          {/* Inner Glass Lip Thickness Ring */}
          <ellipse
            cx="-12"
            cy="0"
            rx="13"
            ry="45"
            stroke="#cbd5e1"
            strokeWidth="1.6"
            strokeOpacity="0.8"
            fill="none"
          />
          {/* Interior Hole Boundary (Clean void straight into the empty jar) */}
          <ellipse
            cx="-10"
            cy="0"
            rx="10"
            ry="42"
            stroke="#64748b"
            strokeWidth="1"
            strokeOpacity="0.45"
            fill="none"
          />

          {/* Front Glass Lip Specular Glints (Catching light on the smooth rim) */}
          {/* Upper Lip Glint */}
          <path
            d="M -16 -46 C -7 -30, -7 -8, -12 6"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeOpacity="0.95"
            strokeLinecap="round"
          />
          {/* Lower Lip Bounce Glint */}
          <path
            d="M -12 18 C -7 30, -7 40, -16 46"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeOpacity="0.9"
            strokeLinecap="round"
          />
          {/* Frontmost Edge Hairline */}
          <path
            d="M -28 -20 C -31 -5, -31 15, -28 28"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeOpacity="0.95"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

export default EmptyCookieJar;
