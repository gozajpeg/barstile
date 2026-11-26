import React from 'react';

/**
 * EmptyCookieJar Component
 * Modeled directly after reference photo:
 * - Clear glass mason jar resting flat on its side on the surface
 * - Wide open threaded mouth facing forward/down-left toward the viewer
 * - Multiple raised glass threads around the neck collar
 * - Natural jute twine rope wrapped around the neck with a rustic knot/bow
 * - Clean glass transparency: pitch-black background breathes through with crisp specular highlights
 * - Contact shadow grounding the jar directly on the surface
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
          {/* Ground Contact Shadow (Soft diffuse shadow under resting glass) */}
          <radialGradient id="jarContactShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#030712" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Transparent Glass Ambient Sheen */}
          <linearGradient id="clearGlassSheen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.12" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.15" />
          </linearGradient>

          {/* Top Edge Specular Glint */}
          <linearGradient id="crestGlint" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="20%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="60%" stopColor="#e2e8f0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
          </linearGradient>

          {/* Bottom Table Reflection Glint */}
          <linearGradient id="bounceGlint" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="35%" stopColor="#93c5fd" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#e2e8f0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
          </linearGradient>

          {/* Glass Mouth Rim Lip Gradient */}
          <linearGradient id="rimLipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#cbd5e1" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#64748b" stopOpacity="0.6" />
            <stop offset="85%" stopColor="#e2e8f0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          {/* Jute Twine Rope Gradient */}
          <linearGradient id="juteTwineRope" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5ce93" />
            <stop offset="35%" stopColor="#bf8542" />
            <stop offset="70%" stopColor="#875322" />
            <stop offset="100%" stopColor="#543314" />
          </linearGradient>
        </defs>

        {/* 1. GROUND CONTACT SHADOW (Directly grounding the glass base and rim) */}
        <ellipse cx="270" cy="196" rx="88" ry="14" fill="url(#jarContactShadow)" />
        <ellipse cx="230" cy="198" rx="45" ry="8" fill="#000000" fillOpacity="0.9" />
        <ellipse cx="295" cy="195" rx="55" ry="9" fill="#000000" fillOpacity="0.8" />

        {/* 2. HORIZONTAL RESTING MASON JAR */}
        {/* Tilted -5 degrees to match the natural tilt of a resting jar */}
        <g transform="translate(172, 94) rotate(-5)">

          {/* A. REAR INTERIOR WALL CURVATURE (Faint glass refraction line in back) */}
          <path
            d="M 134 16 C 146 36, 146 68, 134 88"
            stroke="#ffffff"
            strokeWidth="0.75"
            strokeOpacity="0.18"
            strokeDasharray="2 3"
          />

          {/* B. TRANSPARENT GLASS CYLINDER BODY */}
          <path
            d="M 10 14
               C 24 11, 36 8, 50 6
               L 134 7
               C 152 7, 158 18, 158 52
               C 158 86, 152 97, 134 97
               L 50 98
               C 36 96, 24 93, 10 90
               Z"
            fill="url(#clearGlassSheen)"
            stroke="#64748b"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />

          {/* C. THICK MOLDED GLASS BASE (Right end) */}
          {/* Base outer curvature */}
          <path
            d="M 134 7 C 158 20, 158 84, 134 97"
            stroke="#ffffff"
            strokeWidth="2"
            strokeOpacity="0.75"
            strokeLinecap="round"
          />
          {/* Base inner punt ring */}
          <path
            d="M 142 16 C 150 32, 150 72, 142 88"
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />
          {/* Specular base arc highlight */}
          <path
            d="M 152 30 C 157 42, 157 62, 152 74"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeOpacity="0.9"
            strokeLinecap="round"
          />

          {/* D. GLASS BODY SPECULAR HIGHLIGHTS */}
          {/* Top Horizontal Glint (Crisp white line running along upper crest) */}
          <path
            d="M 46 10 L 138 11"
            stroke="url(#crestGlint)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Secondary upper streak */}
          <path
            d="M 52 17 L 130 18"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          {/* Bottom Table Contact Bounce Glint Line */}
          <path
            d="M 44 94 L 136 93"
            stroke="url(#bounceGlint)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Secondary lower reflection streak */}
          <path
            d="M 50 87 L 128 87"
            stroke="#93c5fd"
            strokeWidth="0.8"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />

          {/* E. GLASS SCREW THREADS ON THE NECK (3 distinct raised mason jar threads) */}
          {/* Thread Ridge 1 */}
          <path
            d="M 0 15 C 7 14, 11 22, 11 52 C 11 82, 7 90, 0 89"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeOpacity="0.6"
            fill="none"
          />
          {/* Thread Ridge 2 */}
          <path
            d="M 5 14 C 12 13, 16 21, 16 52 C 16 83, 12 91, 5 90"
            stroke="#cbd5e1"
            strokeWidth="1.4"
            strokeOpacity="0.5"
            fill="none"
          />
          {/* Thread Ridge 3 */}
          <path
            d="M 11 13 C 18 12, 22 20, 22 52 C 22 84, 18 92, 11 91"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeOpacity="0.65"
            fill="none"
          />

          {/* F. NATURAL JUTE TWINE CORD WRAPPED AROUND NECK */}
          {/* Rope pass 1 */}
          <path
            d="M 16 14 C 23 13, 28 21, 28 52 C 28 83, 23 91, 16 90"
            stroke="url(#juteTwineRope)"
            strokeWidth="3.4"
            fill="none"
          />
          {/* Rope pass 2 */}
          <path
            d="M 20 15 C 26 14, 31 22, 31 52 C 31 82, 26 90, 20 89"
            stroke="url(#juteTwineRope)"
            strokeWidth="3"
            fill="none"
          />
          {/* Twine fiber spiral highlight */}
          <path
            d="M 18 14 C 25 13, 29 21, 29 52 C 29 83, 25 91, 18 90"
            stroke="#fde68a"
            strokeWidth="0.8"
            strokeOpacity="0.75"
            strokeDasharray="2 2"
            fill="none"
          />

          {/* Rustic Twine Knot & Bow on the upper neck */}
          {/* Knot core */}
          <circle cx="18" cy="14" r="4.2" fill="#875322" stroke="#543314" strokeWidth="0.8" />
          <circle cx="19" cy="13" r="2.5" fill="#bf8542" />
          {/* Bow loop left */}
          <path
            d="M 18 14 C 6 2, 0 10, 16 15"
            stroke="url(#juteTwineRope)"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 17 14 C 7 3, 2 9, 15 15"
            stroke="#fde68a"
            strokeWidth="0.7"
            strokeOpacity="0.7"
            fill="none"
          />
          {/* Bow loop right */}
          <path
            d="M 19 14 C 32 0, 40 8, 22 16"
            stroke="url(#juteTwineRope)"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 18 14 C 30 2, 38 9, 21 16"
            stroke="#fde68a"
            strokeWidth="0.7"
            strokeOpacity="0.7"
            fill="none"
          />
          {/* Loose twine cord end 1 */}
          <path
            d="M 17 16 C 12 28, 6 36, 0 38"
            stroke="url(#juteTwineRope)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Loose twine cord end 2 */}
          <path
            d="M 19 16 C 23 30, 26 40, 21 46"
            stroke="url(#juteTwineRope)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* G. WIDE OPEN GLASS MOUTH & RIM (Facing forward-left toward the viewer) */}
          {/* Outer Glass Lip Bevel */}
          <ellipse
            cx="-4"
            cy="52"
            rx="13"
            ry="41"
            stroke="url(#rimLipGrad)"
            strokeWidth="3"
            fill="none"
          />
          {/* Inner Lip Glass Thickness Ring */}
          <ellipse
            cx="-2"
            cy="52"
            rx="9"
            ry="37"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeOpacity="0.8"
            fill="none"
          />
          {/* Inner Void Hole (Clear view into the spotless empty jar) */}
          <ellipse
            cx="-1"
            cy="52"
            rx="6.5"
            ry="34"
            stroke="#64748b"
            strokeWidth="0.8"
            strokeOpacity="0.4"
            fill="none"
          />

          {/* Front Glass Lip Specular Glints */}
          {/* Top bright glint on lip */}
          <path
            d="M -6 16 C 1 26, 1 42, -3 50"
            stroke="#ffffff"
            strokeWidth="2.6"
            strokeOpacity="0.95"
            strokeLinecap="round"
          />
          {/* Bottom bounce glint on lip */}
          <path
            d="M -3 60 C 1 70, 1 80, -5 88"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeOpacity="0.9"
            strokeLinecap="round"
          />
          {/* Frontmost edge reflection */}
          <path
            d="M -16 36 C -18 46, -18 60, -16 68"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeOpacity="0.95"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

export default EmptyCookieJar;
