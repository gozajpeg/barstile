import React from 'react';

/**
 * UtilityPole Component
 * High-definition architectural perspective illustration of a dedicated utility pole:
 * - A single, high-quality transmission cable spanning all the way across the card.
 * - Layered conductor rendering: atmospheric aerial halo, metallic conductor body, and specular top glint.
 * - Single precision suspension clamp at the ceramic insulator with a clean transformer jumper.
 * - Vertical pole rising along the right edge with dual crossarms, braces, and transformers.
 * - Zero third-party taps or tangled rat's nest: "Yours is always yours."
 */
export function UtilityPole({ className = '' }) {
  // Single high-quality catenary cable curve across the entire sky
  // From beyond right edge (x=400, y=14) through insulator clamp (x=268, y=28) to far left (x=-20, y=72)
  const cablePath = "M 400 14 L 272 26 C 180 58, 80 72, -20 68";
  // Cable highlight glint (offset 0.4px higher)
  const cableHighlightPath = "M 400 13.6 L 272 25.6 C 180 57.6, 80 71.6, -20 67.6";

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
          {/* Subtle sky ambient glow centered near crossarm */}
          <radialGradient id="poleSkyGlow" cx="72%" cy="26%" r="65%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* High-Quality Cable Conductor Gradient */}
          <linearGradient id="hqCableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.75" />
            <stop offset="25%" stopColor="#e2e8f0" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="75%" stopColor="#cbd5e1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.8" />
          </linearGradient>

          {/* Mast/Pole Gradient (Weathered Concrete / Dark Treated Wood) */}
          <linearGradient id="poleBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#343740" />
            <stop offset="35%" stopColor="#262830" />
            <stop offset="70%" stopColor="#1a1c22" />
            <stop offset="100%" stopColor="#101114" />
          </linearGradient>

          {/* Crossarm Steel Gradient */}
          <linearGradient id="crossarmGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a3d46" />
            <stop offset="50%" stopColor="#252830" />
            <stop offset="100%" stopColor="#14151a" />
          </linearGradient>

          {/* Transformer Cylinder Specular Lighting Gradient */}
          <linearGradient id="transformerCanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b3e48" />
            <stop offset="25%" stopColor="#2c2f37" />
            <stop offset="65%" stopColor="#1e2026" />
            <stop offset="90%" stopColor="#14151a" />
            <stop offset="100%" stopColor="#0d0e12" />
          </linearGradient>

          {/* Ceramic Insulator Glaze Gradient */}
          <linearGradient id="insulatorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4a4e5a" />
            <stop offset="50%" stopColor="#2e313a" />
            <stop offset="100%" stopColor="#17181e" />
          </linearGradient>
        </defs>

        {/* Ambient Sky Backlight */}
        <ellipse cx="270" cy="80" rx="150" ry="90" fill="url(#poleSkyGlow)" />

        {/* ============================================================== */}
        {/* 1. SINGLE HIGH-QUALITY TRANSMISSION LINE (All Across)           */}
        {/* ============================================================== */}
        {/* Layer 1: Soft Atmospheric Glow / Ambient Light Catch */}
        <path
          d={cablePath}
          stroke="#ffffff"
          strokeOpacity="0.08"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Layer 2: Main Conductor Core Body */}
        <path
          d={cablePath}
          stroke="url(#hqCableGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Layer 3: Specular Top Glint / Highlight Thread */}
        <path
          d={cableHighlightPath}
          stroke="#ffffff"
          strokeWidth="0.65"
          strokeOpacity="0.95"
          strokeLinecap="round"
          fill="none"
        />

        {/* Single Jumper Lead: Dropping cleanly from the clamp into the transformer bushing */}
        <path
          d="M 268 28 C 264 45, 258 60, 254 78"
          stroke="#717688"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Jumper wire highlight */}
        <path
          d="M 268 28 C 264 45, 258 60, 254 78"
          stroke="#ffffff"
          strokeWidth="0.4"
          strokeOpacity="0.6"
          strokeLinecap="round"
          fill="none"
        />

        {/* ============================================================== */}
        {/* 2. THE UTILITY POLE MAST                                       */}
        {/* ============================================================== */}
        {/* Main Vertical Mast (Subtly tapered, rising from bottom to top) */}
        <polygon
          points="272,260 288,260 285,15 275,15"
          fill="url(#poleBodyGrad)"
          stroke="#3d414c"
          strokeWidth="0.6"
        />
        {/* Pole highlight edge along left facing side */}
        <line x1="274" y1="15" x2="273" y2="260" stroke="#525764" strokeWidth="0.75" />
        {/* Pole shadow line along right edge */}
        <line x1="285" y1="15" x2="288" y2="260" stroke="#08090b" strokeWidth="1" />
        {/* Mast Cap at very top */}
        <polygon points="273,15 287,15 280,10" fill="#424652" stroke="#25272e" strokeWidth="0.5" />

        {/* Climbing Pegs / Hardware Steps */}
        {[80, 115, 150, 185, 220].map((py, idx) => {
          const isLeft = idx % 2 === 0;
          return isLeft ? (
            <path key={`peg-${idx}`} d={`M 273 ${py} L 265 ${py} L 265 ${py - 3}`} stroke="#6b7080" strokeWidth="1.2" fill="none" />
          ) : (
            <path key={`peg-${idx}`} d={`M 287 ${py} L 295 ${py} L 295 ${py - 3}`} stroke="#6b7080" strokeWidth="1.2" fill="none" />
          );
        })}

        {/* ============================================================== */}
        {/* 3. DUAL CROSSARMS & INVERTED V-BRACING                         */}
        {/* ============================================================== */}
        {/* Inverted V Diagonal Steel Braces */}
        <line x1="235" y1="68" x2="280" y2="98" stroke="#484c58" strokeWidth="2" strokeLinecap="round" />
        <line x1="325" y1="68" x2="280" y2="98" stroke="#484c58" strokeWidth="2" strokeLinecap="round" />
        <circle cx="280" cy="98" r="2.5" fill="#1c1d23" stroke="#5a5e6d" strokeWidth="0.75" />

        {/* Lower Crossarm */}
        <rect x="228" y="64" width="104" height="7.5" rx="1" fill="url(#crossarmGrad)" stroke="#4a4e5b" strokeWidth="0.6" />
        {/* Upper Crossarm */}
        <rect x="238" y="34" width="84" height="7" rx="1" fill="url(#crossarmGrad)" stroke="#4a4e5b" strokeWidth="0.6" />

        {/* Ceramic Bell / Pin Insulators on Crossarms */}
        {/* Upper Crossarm Insulators */}
        {[248, 268, 292, 312].map((ix, i) => {
          const isActiveInsulator = ix === 268;
          return (
            <g key={`upper-ins-${i}`}>
              <rect x={ix - 3.5} y="26" width="7" height="8" rx="1.5" fill="url(#insulatorGrad)" stroke="#555968" strokeWidth="0.5" />
              <line x1={ix - 4} y1="29" x2={ix + 4} y2="29" stroke="#686c7c" strokeWidth="0.6" />
              <line x1={ix - 4} y1="32" x2={ix + 4} y2="32" stroke="#686c7c" strokeWidth="0.6" />
              <line x1={ix} y1="26" x2={ix} y2="22" stroke="#8b90a0" strokeWidth="1" />

              {/* High-Precision Aluminum Strain Clamp on the active conductor insulator */}
              {isActiveInsulator && (
                <g>
                  {/* Clamp body bracket */}
                  <rect x={ix - 4.5} y="24" width="9" height="5" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
                  {/* Clamp bolt heads */}
                  <circle cx={ix - 2.5} cy="26.5" r="0.8" fill="#1e293b" />
                  <circle cx={ix + 2.5} cy="26.5" r="0.8" fill="#1e293b" />
                </g>
              )}
            </g>
          );
        })}

        {/* Lower Crossarm Insulators */}
        {[238, 258, 302, 322].map((ix, i) => (
          <g key={`lower-ins-${i}`}>
            <rect x={ix - 3.5} y="56" width="7" height="8" rx="1.5" fill="url(#insulatorGrad)" stroke="#555968" strokeWidth="0.5" />
            <line x1={ix - 4} y1="59" x2={ix + 4} y2="59" stroke="#686c7c" strokeWidth="0.6" />
            <line x1={ix - 4} y1="62" x2={ix + 4} y2="62" stroke="#686c7c" strokeWidth="0.6" />
            <line x1={ix} y1="56" x2={ix} y2="52" stroke="#8b90a0" strokeWidth="1" />
          </g>
        ))}

        {/* ============================================================== */}
        {/* 4. CYLINDRICAL DISTRIBUTION TRANSFORMERS (The "Cans")          */}
        {/* ============================================================== */}
        {/* Transformer Mounting Bracket Frame */}
        <rect x="240" y="112" width="75" height="5" fill="#1b1c22" stroke="#3b3e4a" strokeWidth="0.5" />

        {/* --- LEFT TRANSFORMER (Front/Main) --- */}
        <g>
          {/* Side Cooling Fins */}
          <rect x="238" y="90" width="3" height="38" fill="#1c1d24" stroke="#343742" strokeWidth="0.4" />
          <rect x="267" y="90" width="3" height="38" fill="#121318" />
          {/* Main Cylindrical Body */}
          <rect x="240" y="86" width="28" height="46" rx="2" fill="url(#transformerCanGrad)" stroke="#444754" strokeWidth="0.75" />
          {/* Top Lid Ring */}
          <ellipse cx="254" cy="86" rx="14" ry="3.5" fill="#32353e" stroke="#525666" strokeWidth="0.6" />
          {/* Bottom Rim */}
          <ellipse cx="254" cy="132" rx="14" ry="3.5" fill="#131418" stroke="#252730" strokeWidth="0.6" />
          {/* Top Bushing Insulators */}
          <rect x="246" y="78" width="4" height="8" rx="1" fill="#4d515e" stroke="#2a2c35" strokeWidth="0.4" />
          <circle cx="248" cy="78" r="1.5" fill="#d4af37" />
          <rect x="258" y="78" width="4" height="8" rx="1" fill="#4d515e" stroke="#2a2c35" strokeWidth="0.4" />
          <circle cx="260" cy="78" r="1.5" fill="#d4af37" />
          {/* Grounding / Secondary Lug */}
          <rect x="242" y="102" width="2" height="4" fill="#a07a2a" />
        </g>

        {/* --- RIGHT TRANSFORMER (Slightly behind mast) --- */}
        <g>
          {/* Side Cooling Fin */}
          <rect x="317" y="96" width="3" height="38" fill="#121318" />
          {/* Main Cylindrical Body */}
          <rect x="290" y="92" width="28" height="46" rx="2" fill="url(#transformerCanGrad)" stroke="#3e414d" strokeWidth="0.7" />
          {/* Top Lid Ring */}
          <ellipse cx="304" cy="92" rx="14" ry="3.5" fill="#2d3038" stroke="#484c5a" strokeWidth="0.5" />
          {/* Bottom Rim */}
          <ellipse cx="304" cy="138" rx="14" ry="3.5" fill="#101115" stroke="#21232a" strokeWidth="0.5" />
          {/* Top Bushing Insulator */}
          <rect x="296" y="84" width="4" height="8" rx="1" fill="#444754" stroke="#252730" strokeWidth="0.4" />
          <circle cx="298" cy="84" r="1.5" fill="#d4af37" />
        </g>

        {/* ============================================================== */}
        {/* 5. STREETLIGHT FIXTURE (Modeled from reference image)          */}
        {/* ============================================================== */}
        <g>
          {/* Mounting arm curving outward to the left */}
          <path
            d="M 276 178 C 260 178, 235 186, 222 195"
            stroke="#454854"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Fixture Luminaire Head */}
          <ellipse cx="220" cy="196" rx="8" ry="3.5" fill="#2a2c35" stroke="#4b4f5d" strokeWidth="0.6" />
          {/* Gentle downlight warm/white lens */}
          <ellipse cx="220" cy="197" rx="6" ry="2" fill="#fff" fillOpacity="0.4" />
        </g>
      </svg>
    </div>
  );
}

export default UtilityPole;
