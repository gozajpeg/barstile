import React from 'react';

/**
 * EmptyCookieJar Component
 * Real-world glass cookie jar resting on its side on the right side of the card:
 * - Threaded glass mouth open and facing left
 * - Transparent cylindrical glass body with specular light reflections
 * - Thick molded glass base and rim
 * - Zero cookies, zero crumbs inside: pristine, spotless transparency
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
          {/* Glass body surface gradient: subtle transparent sheen */}
          <linearGradient id="glassBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="20%" stopColor="#38bdf8" stopOpacity="0.03" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.01" />
            <stop offset="85%" stopColor="#38bdf8" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.09" />
          </linearGradient>

          {/* Glass edge refraction gradient */}
          <linearGradient id="glassEdgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#94a3b8" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#cbd5e1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
          </linearGradient>

          {/* Base bottom glass thickness gradient */}
          <linearGradient id="glassBaseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#64748b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>

          {/* Twine cord gradient */}
          <linearGradient id="twineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4b483" />
            <stop offset="50%" stopColor="#a67c52" />
            <stop offset="100%" stopColor="#785434" />
          </linearGradient>
        </defs>

        {/* Jar Container Group: Positioned on the right, tilted resting on its belly */}
        <g transform="translate(195, 65) rotate(-6)">
          {/* 1. REAR INTERIOR WALL (Visible through transparent front glass) */}
          {/* Interior back curvature */}
          <path
            d="M 28 32 C 60 26, 120 28, 140 34 C 152 50, 152 75, 140 92 C 120 98, 60 100, 28 94 Z"
            fill="#ffffff"
            fillOpacity="0.015"
          />
          {/* Inner back base curve */}
          <path
            d="M 136 36 C 146 50, 146 76, 136 90"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.18"
            strokeDasharray="3 3"
          />

          {/* 2. GLASS JAR BODY (Outer transparent shell) */}
          <path
            d="M 26 24
               C 42 22, 54 26, 62 26
               L 136 28
               C 152 28, 156 36, 156 63
               C 156 90, 152 98, 136 98
               L 62 100
               C 54 100, 42 104, 26 102
               Z"
            fill="url(#glassBodyGrad)"
            stroke="url(#glassEdgeGrad)"
            strokeWidth="1.2"
          />

          {/* 3. THICK GLASS BASE (Right end of the jar) */}
          {/* Outer base curvature */}
          <path
            d="M 136 28 C 155 42, 155 84, 136 98"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeOpacity="0.6"
            strokeLinecap="round"
          />
          {/* Inner punt indentation (concave molded glass bottom) */}
          <path
            d="M 142 38 C 148 50, 148 76, 142 88"
            stroke="#94a3b8"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          {/* Bottom glass thickness filler */}
          <path
            d="M 136 29 C 148 44, 148 82, 136 97 L 140 95 C 152 80, 152 46, 140 31 Z"
            fill="url(#glassBaseGrad)"
          />

          {/* 4. LONGITUDINAL SPECULAR HIGHLIGHTS (Curved reflections on cylinder) */}
          {/* Upper bright glint streak */}
          <path
            d="M 38 31 L 138 33"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.85"
            strokeLinecap="round"
          />
          {/* Secondary softer upper reflection */}
          <path
            d="M 44 36 L 132 38"
            stroke="#ffffff"
            strokeWidth="0.6"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />
          {/* Lower bounce highlight */}
          <path
            d="M 36 94 L 134 92"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.5"
            strokeLinecap="round"
          />

          {/* 5. SCREW THREADS ON THE GLASS NECK */}
          {/* Thread ridge 1 */}
          <path
            d="M 18 29 C 24 28, 28 32, 28 63 C 28 94, 24 98, 18 97"
            stroke="#ffffff"
            strokeWidth="1"
            strokeOpacity="0.45"
            fill="none"
          />
          {/* Thread ridge 2 */}
          <path
            d="M 23 27 C 28 26, 32 30, 32 63 C 32 96, 28 100, 23 99"
            stroke="#cbd5e1"
            strokeWidth="0.8"
            strokeOpacity="0.35"
            fill="none"
          />

          {/* 6. TWINE TIE AROUND THE NECK (from reference photo) */}
          {/* Cord wrapping lines */}
          <path
            d="M 32 31 C 36 30, 40 34, 40 63 C 40 92, 36 96, 32 95"
            stroke="url(#twineGrad)"
            strokeWidth="2.4"
            fill="none"
          />
          <path
            d="M 35 32 C 39 31, 42 35, 42 63 C 42 91, 39 94, 35 94"
            stroke="url(#twineGrad)"
            strokeWidth="2"
            fill="none"
          />
          {/* Twine rustic knot on top */}
          <circle cx="34" cy="30" r="3" fill="#a67c52" stroke="#785434" strokeWidth="0.6" />
          {/* Knot bow loops */}
          <path
            d="M 34 30 C 26 22, 22 28, 32 30"
            stroke="#c8a268"
            strokeWidth="1.6"
            fill="none"
          />
          <path
            d="M 34 30 C 42 20, 48 26, 36 31"
            stroke="#c8a268"
            strokeWidth="1.6"
            fill="none"
          />
          {/* Loose twine cord ends */}
          <path
            d="M 34 31 C 28 38, 24 44, 20 45"
            stroke="#a67c52"
            strokeWidth="1.4"
            fill="none"
          />
          <path
            d="M 35 31 C 38 40, 40 46, 37 52"
            stroke="#a67c52"
            strokeWidth="1.3"
            fill="none"
          />

          {/* 7. JAR MOUTH & RIM (Facing left, completely empty opening) */}
          {/* Outer glass lip ring */}
          <ellipse
            cx="14"
            cy="63"
            rx="9"
            ry="39"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeOpacity="0.9"
            fill="none"
          />
          {/* Inner mouth hole (void: reveals nothing inside) */}
          <ellipse
            cx="14"
            cy="63"
            rx="6.5"
            ry="36"
            stroke="#64748b"
            strokeWidth="0.8"
            strokeOpacity="0.5"
            fill="none"
          />
          {/* Front lip specular glint */}
          <path
            d="M 12 28 C 17 38, 17 88, 12 98"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />
          <path
            d="M 7 42 C 9 52, 9 74, 7 84"
            stroke="#ffffff"
            strokeWidth="0.9"
            strokeOpacity="0.95"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

export default EmptyCookieJar;
