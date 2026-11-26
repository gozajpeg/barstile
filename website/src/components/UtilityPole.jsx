import React from 'react';

/**
 * UtilityPole Component
 * Close-up low-angle perspective of the top of the utility pole mast:
 * - Camera positioned close to the base looking straight up at the summit
 * - Massive heavy-timber mast with perspective taper and weather-resistant cap
 * - Heavy industrial dual crossarms with central steel mounting plates and through-bolts
 * - Thick forged diagonal steel V-braces supporting the beams
 * - Heavy forged iron climbing steps and grounding wire running down the mast
 * - Cleaned of all wires and transformers per user specification
 */
export function UtilityPole({ className = '' }) {
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
          {/* Heavy Mast Wood/Composite Gradient with strong dimensional shading */}
          <linearGradient id="closeMastGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#474d5b" />
            <stop offset="25%" stopColor="#323743" />
            <stop offset="65%" stopColor="#1e222a" />
            <stop offset="90%" stopColor="#14161c" />
            <stop offset="100%" stopColor="#0b0c0f" />
          </linearGradient>

          {/* Crossarm Timber Beam Gradient */}
          <linearGradient id="closeBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4e5564" />
            <stop offset="35%" stopColor="#353b47" />
            <stop offset="75%" stopColor="#22262f" />
            <stop offset="100%" stopColor="#121419" />
          </linearGradient>

          {/* Steel Hardware / Mounting Plate Gradient */}
          <linearGradient id="steelPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#717786" />
            <stop offset="50%" stopColor="#3f4450" />
            <stop offset="100%" stopColor="#1d2027" />
          </linearGradient>
        </defs>

        {/* ============================================================== */}
        {/* 1. LOWER HEAVY CROSSARM & INVERTED-V STEEL BRACING             */}
        {/* ============================================================== */}
        {/* Heavy Forged Diagonal Steel Struts (Bracing lower crossarm) */}
        <line x1="210" y1="120" x2="300" y2="175" stroke="#4b5160" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="210" y1="119" x2="300" y2="174" stroke="#8b93a4" strokeWidth="1.2" strokeLinecap="round" />

        <line x1="390" y1="120" x2="300" y2="175" stroke="#373c47" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="390" y1="119" x2="300" y2="174" stroke="#686f7e" strokeWidth="1.2" strokeLinecap="round" />

        {/* Central Strut Mounting Bracket on Mast */}
        <rect x="290" y="165" width="20" height="18" rx="2" fill="url(#steelPlateGrad)" stroke="#1a1c22" strokeWidth="1" />
        <circle cx="300" cy="174" r="3.5" fill="#181a20" stroke="#717786" strokeWidth="1" />
        <circle cx="300" cy="174" r="1.5" fill="#9ca3af" />

        {/* Lower Crossarm Heavy Beam (Thick timber, close perspective) */}
        <g>
          {/* Main beam body */}
          <rect x="195" y="104" width="205" height="18" rx="2" fill="url(#closeBeamGrad)" stroke="#2b2f38" strokeWidth="1" />
          {/* Top highlight chamfer edge */}
          <line x1="196" y1="105" x2="399" y2="105" stroke="#7e8697" strokeWidth="1.2" />
          {/* Bottom shadow edge */}
          <line x1="196" y1="121" x2="399" y2="121" stroke="#0d0e12" strokeWidth="1.5" />
          {/* Left end grain plate */}
          <rect x="195" y="104" width="5" height="18" rx="1" fill="#252932" stroke="#16181e" strokeWidth="0.8" />
          {/* Center mounting plate on crossarm */}
          <rect x="288" y="102" width="24" height="22" rx="2" fill="url(#steelPlateGrad)" stroke="#1a1c22" strokeWidth="1" />
          <circle cx="294" cy="113" r="2.2" fill="#16181f" stroke="#828896" strokeWidth="0.8" />
          <circle cx="306" cy="113" r="2.2" fill="#16181f" stroke="#828896" strokeWidth="0.8" />
        </g>

        {/* ============================================================== */}
        {/* 2. UPPER HEAVY CROSSARM                                        */}
        {/* ============================================================== */}
        <g>
          {/* Upper beam body */}
          <rect x="215" y="48" width="170" height="16" rx="2" fill="url(#closeBeamGrad)" stroke="#2b2f38" strokeWidth="1" />
          {/* Top highlight chamfer edge */}
          <line x1="216" y1="49" x2="384" y2="49" stroke="#7e8697" strokeWidth="1.2" />
          {/* Bottom shadow edge */}
          <line x1="216" y1="63" x2="384" y2="63" stroke="#0d0e12" strokeWidth="1.5" />
          {/* Left end grain plate */}
          <rect x="215" y="48" width="5" height="16" rx="1" fill="#252932" stroke="#16181e" strokeWidth="0.8" />
          {/* Center mounting plate */}
          <rect x="289" y="46" width="22" height="20" rx="2" fill="url(#steelPlateGrad)" stroke="#1a1c22" strokeWidth="1" />
          <circle cx="300" cy="56" r="2.5" fill="#16181f" stroke="#828896" strokeWidth="0.8" />
        </g>

        {/* ============================================================== */}
        {/* 3. CLOSE-UP TAPERED MAST & SUMMIT CAP                          */}
        {/* ============================================================== */}
        {/* Main Mast Body: Substantial, thick, low-angle perspective */}
        <polygon
          points="278,260 326,260 318,18 284,18"
          fill="url(#closeMastGrad)"
          stroke="#2d323c"
          strokeWidth="1"
        />
        {/* Mast left specular highlight ridge */}
        <line x1="285" y1="18" x2="280" y2="260" stroke="#717887" strokeWidth="1.8" />
        <line x1="289" y1="18" x2="286" y2="260" stroke="#484f5c" strokeWidth="1" />
        {/* Mast right deep cast shadow ridge */}
        <line x1="318" y1="18" x2="326" y2="260" stroke="#050608" strokeWidth="2.5" />

        {/* Mast Summit Cap (Heavy beveled pyramidal top cap) */}
        <polygon points="280,18 322,18 301,6" fill="#4d5361" stroke="#1e2128" strokeWidth="1" />
        <polygon points="280,18 301,6 301,18" fill="#5a6170" />
        <line x1="301" y1="6" x2="301" y2="18" stroke="#788090" strokeWidth="1" />

        {/* Copper Grounding Wire stapled along the mast */}
        <path
          d="M 285 22 L 283 80 L 281 140 L 279 260"
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeOpacity="0.6"
          fill="none"
        />

        {/* Heavy Forged Iron Climbing Pegs / Lineman Steps */}
        {[85, 135, 185, 230].map((py, idx) => {
          const isLeft = idx % 2 === 0;
          return isLeft ? (
            <g key={`step-${idx}`}>
              {/* Step mounting base plate */}
              <rect x="281" y={py - 3} width="4" height="8" rx="1" fill="#1e2129" stroke="#525866" strokeWidth="0.6" />
              {/* L-step bar */}
              <path
                d={`M 281 ${py} L 265 ${py} L 265 ${py - 7}`}
                stroke="#686f7e"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d={`M 281 ${py - 0.5} L 266 ${py - 0.5} L 266 ${py - 7}`}
                stroke="#9ca3af"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          ) : (
            <g key={`step-${idx}`}>
              <rect x="319" y={py - 3} width="4" height="8" rx="1" fill="#12141a" stroke="#373c47" strokeWidth="0.6" />
              <path
                d={`M 321 ${py} L 337 ${py} L 337 ${py - 7}`}
                stroke="#474c58"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default UtilityPole;
