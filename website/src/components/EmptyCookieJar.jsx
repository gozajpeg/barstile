import React from 'react';

/**
 * EmptyCookieJar Component
 * High-definition perspective illustration of an empty glass jar lying on its side:
 * - Dynamic 3D perspective: open mouth facing forward-left, body receding back-right
 * - Rich glass volume with realistic refraction, wall thickness, and specular gleam
 * - Thick molded glass base and dual-lip screw-threaded mouth
 * - Braided jute twine tied around the neck with loops and frayed ends
 * - Soft contact ground shadow grounding the jar
 * - Completely, cleanly empty: "Zero cookies. Not even the crumbs."
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
          <radialGradient id="jarGroundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#020408" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Glass Outer Body Volume (Subtle translucent dark glass body) */}
          <linearGradient id="jarBodyVolume" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#252a36" stopOpacity="0.5" />
            <stop offset="25%" stopColor="#141822" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#0b0e14" stopOpacity="0.25" />
            <stop offset="95%" stopColor="#181d28" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#2e3544" stopOpacity="0.65" />
          </linearGradient>

          {/* Rear Interior Wall Gradient */}
          <radialGradient id="jarInteriorVoid" cx="40%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#0f131a" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#080a0f" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#030407" stopOpacity="0.95" />
          </radialGradient>

          {/* Top Specular Glint Gradient */}
          <linearGradient id="topGlintGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#e2e8f0" stopOpacity="0.85" />
            <stop offset="90%" stopColor="#94a3b8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>

          {/* Bottom Table Reflection Glint */}
          <linearGradient id="bottomGlintGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="35%" stopColor="#93c5fd" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#cbd5e1" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
          </linearGradient>

          {/* Heavy Glass Lip Ring Gradient */}
          <linearGradient id="lipRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#94a3b8" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#cbd5e1" stopOpacity="0.8" />
            <stop offset="85%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
          </linearGradient>

          {/* Thick Molded Glass Base Gradient */}
          <linearGradient id="baseGlassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a1e28" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#2c3342" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#1e2430" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0e1117" stopOpacity="0.95" />
          </linearGradient>

          {/* Braided Jute Twine Gradient */}
          <linearGradient id="twineFiber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2b170" />
            <stop offset="35%" stopColor="#b88344" />
            <stop offset="70%" stopColor="#8c5828" />
            <stop offset="100%" stopColor="#5c3614" />
          </linearGradient>
        </defs>

        {/* 1. GROUND CONTACT SHADOW */}
        <ellipse cx="270" cy="192" rx="95" ry="18" fill="url(#jarGroundShadow)" />
        <ellipse cx="230" cy="188" rx="60" ry="12" fill="#000000" fillOpacity="0.6" />

        {/* JAR MAIN GROUP: Tilted resting on its side on the right */}
        <g transform="translate(160, 48) rotate(-7)">

          {/* 2. INTERIOR VOID BACKGROUND (Seen through mouth and clear glass) */}
          {/* Jar interior silhouette */}
          <path
            d="M 50 36
               C 85 28, 145 28, 175 35
               C 192 56, 192 98, 175 120
               C 145 128, 85 130, 50 122
               Z"
            fill="url(#jarInteriorVoid)"
          />

          {/* 3. REAR INTERNAL BASE CONTOURS (Molded glass punt) */}
          <path
            d="M 172 40 C 184 58, 184 98, 172 116"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.25"
            fill="none"
          />
          <path
            d="M 178 48 C 188 64, 188 92, 178 108"
            stroke="#64748b"
            strokeWidth="1"
            strokeOpacity="0.3"
            fill="none"
          />

          {/* 4. MAIN GLASS CYLINDER BODY (Thick translucent shell) */}
          <path
            d="M 44 26
               C 70 20, 100 24, 115 24
               L 172 26
               C 194 26, 202 38, 202 78
               C 202 118, 194 130, 172 130
               L 115 132
               C 100 132, 70 136, 44 130
               Z"
            fill="url(#jarBodyVolume)"
            stroke="#475569"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* 5. HEAVY MOLDED GLASS BASE (Right end) */}
          {/* Base outer curvature */}
          <path
            d="M 172 26 C 204 46, 204 110, 172 130"
            fill="url(#baseGlassGrad)"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeOpacity="0.75"
            strokeLinecap="round"
          />
          {/* Base bottom bevel edge highlight */}
          <path
            d="M 180 34 C 208 52, 208 104, 180 122"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Glass base thickness specular rim */}
          <path
            d="M 194 56 C 202 66, 202 90, 194 100"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeOpacity="0.9"
            strokeLinecap="round"
          />

          {/* 6. GLASS BODY SPECULAR HIGHLIGHTS */}
          {/* Primary Top Highlight (Sharp glint running full length) */}
          <path
            d="M 52 32 L 176 34"
            stroke="url(#topGlintGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Secondary Soft Ambient Highlight */}
          <path
            d="M 60 40 L 168 42"
            stroke="#ffffff"
            strokeWidth="1"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          {/* Center Glass Reflection Band (Curved cylindrical glass sheen) */}
          <path
            d="M 56 68 C 90 66, 140 68, 170 70"
            stroke="#ffffff"
            strokeWidth="0.75"
            strokeOpacity="0.18"
          />
          {/* Bottom Table Bounce Light Line */}
          <path
            d="M 50 125 L 174 123"
            stroke="url(#bottomGlintGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Bottom Rim Secondary Reflection */}
          <path
            d="M 58 118 L 165 117"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />

          {/* 7. GLASS SCREW THREADS ON THE NECK */}
          {/* Thread Ridge 1 */}
          <path
            d="M 32 32 C 40 30, 46 36, 46 78 C 46 120, 40 126, 32 124"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeOpacity="0.55"
            fill="none"
          />
          {/* Thread Ridge 2 */}
          <path
            d="M 39 30 C 47 28, 53 34, 53 78 C 53 122, 47 128, 39 126"
            stroke="#94a3b8"
            strokeWidth="1.3"
            strokeOpacity="0.45"
            fill="none"
          />

          {/* 8. JUTE TWINE ROPE WRAPPED AROUND THE NECK */}
          {/* First rope wrap */}
          <path
            d="M 44 33 C 51 31, 58 38, 58 78 C 58 118, 51 125, 44 123"
            stroke="url(#twineFiber)"
            strokeWidth="3.2"
            fill="none"
          />
          {/* Rope strand texture highlight */}
          <path
            d="M 44 33 C 51 31, 58 38, 58 78 C 58 118, 51 125, 44 123"
            stroke="#fed7aa"
            strokeWidth="0.8"
            strokeOpacity="0.6"
            strokeDasharray="2 2"
            fill="none"
          />
          {/* Second rope wrap */}
          <path
            d="M 48 34 C 55 33, 61 40, 61 78 C 61 116, 55 123, 48 122"
            stroke="url(#twineFiber)"
            strokeWidth="2.8"
            fill="none"
          />
          {/* Third rope wrap */}
          <path
            d="M 52 36 C 58 35, 64 42, 64 78 C 64 114, 58 121, 52 120"
            stroke="url(#twineFiber)"
            strokeWidth="2.4"
            fill="none"
          />

          {/* Twine Rustic Knot & Loops (Resting on upper neck) */}
          {/* Knot core */}
          <circle cx="48" cy="32" r="4.5" fill="#a16207" stroke="#713f12" strokeWidth="0.8" />
          <circle cx="49" cy="31" r="3" fill="#ca8a04" />
          {/* Loop 1 */}
          <path
            d="M 48 31 C 36 18, 28 26, 45 32"
            stroke="url(#twineFiber)"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Loop 2 */}
          <path
            d="M 49 32 C 62 16, 72 24, 51 34"
            stroke="url(#twineFiber)"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Trailing End 1 (Draped naturally down the side of the glass) */}
          <path
            d="M 48 33 C 40 44, 34 52, 28 54 C 25 55, 22 53, 20 56"
            stroke="url(#twineFiber)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Trailing End 2 */}
          <path
            d="M 50 33 C 54 46, 57 58, 52 66"
            stroke="url(#twineFiber)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* 9. WIDE GLASS MOUTH & RIM (Facing forward-left, heavy 3D glass lip) */}
          {/* Outer Glass Lip Rim */}
          <ellipse
            cx="24"
            cy="78"
            rx="14"
            ry="52"
            stroke="url(#lipRimGrad)"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Glass Lip Thickness Ring (Inner bevel) */}
          <ellipse
            cx="24"
            cy="78"
            rx="10"
            ry="48"
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeOpacity="0.6"
            fill="none"
          />
          {/* Inner Void Hole (Clear view into the spotless empty jar) */}
          <ellipse
            cx="25"
            cy="78"
            rx="8"
            ry="45"
            stroke="#475569"
            strokeWidth="0.8"
            strokeOpacity="0.4"
            fill="none"
          />

          {/* Front Rim Specular Flare Glints */}
          {/* Top bright glint on lip */}
          <path
            d="M 22 30 C 29 44, 29 60, 26 70"
            stroke="#ffffff"
            strokeWidth="2"
            strokeOpacity="0.95"
            strokeLinecap="round"
          />
          {/* Bottom bounce glint on lip */}
          <path
            d="M 23 90 C 28 104, 28 118, 22 126"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeOpacity="0.85"
            strokeLinecap="round"
          />
          {/* Crisp front edge hairline */}
          <path
            d="M 14 55 C 16 68, 16 88, 14 101"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.9"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

export default EmptyCookieJar;
