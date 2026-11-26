import React from 'react';

const STEPS = [
  { x: 281, y: 85, dx: -16 },
  { x: 319, y: 135, dx: 18 },
  { x: 281, y: 185, dx: -16 },
  { x: 319, y: 230, dx: 18 }
];

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
          <linearGradient id="closeMastGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#474d5b" />
            <stop offset="25%" stopColor="#323743" />
            <stop offset="65%" stopColor="#1e222a" />
            <stop offset="90%" stopColor="#14161c" />
            <stop offset="100%" stopColor="#0b0c0f" />
          </linearGradient>

          <linearGradient id="closeBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4e5564" />
            <stop offset="35%" stopColor="#353b47" />
            <stop offset="75%" stopColor="#22262f" />
            <stop offset="100%" stopColor="#121419" />
          </linearGradient>

          <linearGradient id="steelPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#717786" />
            <stop offset="50%" stopColor="#3f4450" />
            <stop offset="100%" stopColor="#1d2027" />
          </linearGradient>
        </defs>

        <g transform="translate(-38, 6)">
          {/* Struts */}
          <line x1="210" y1="120" x2="300" y2="175" stroke="#4b5160" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="390" y1="120" x2="300" y2="175" stroke="#373c47" strokeWidth="4.5" strokeLinecap="round" />
          <rect x="290" y="165" width="20" height="18" rx="2" fill="url(#steelPlateGrad)" stroke="#1a1c22" strokeWidth="1" />
          <circle cx="300" cy="174" r="3.5" fill="#181a20" stroke="#717786" strokeWidth="1" />
          <circle cx="300" cy="174" r="1.5" fill="#9ca3af" />

          {/* Lower Crossarm */}
          <g>
            <rect x="195" y="104" width="205" height="18" rx="2" fill="url(#closeBeamGrad)" stroke="#2b2f38" strokeWidth="1" />
            <line x1="196" y1="105" x2="399" y2="105" stroke="#7e8697" strokeWidth="1" />
            <rect x="195" y="104" width="5" height="18" rx="1" fill="#252932" />
            <rect x="395" y="104" width="5" height="18" rx="1" fill="#16181e" />
            <rect x="288" y="102" width="24" height="22" rx="2" fill="url(#steelPlateGrad)" stroke="#1a1c22" strokeWidth="1" />
            <circle cx="294" cy="113" r="2.2" fill="#16181f" stroke="#828896" strokeWidth="0.8" />
            <circle cx="306" cy="113" r="2.2" fill="#16181f" stroke="#828896" strokeWidth="0.8" />
          </g>

          {/* Upper Crossarm */}
          <g>
            <rect x="215" y="48" width="170" height="16" rx="2" fill="url(#closeBeamGrad)" stroke="#2b2f38" strokeWidth="1" />
            <line x1="216" y1="49" x2="384" y2="49" stroke="#7e8697" strokeWidth="1" />
            <rect x="215" y="48" width="5" height="16" rx="1" fill="#252932" />
            <rect x="380" y="48" width="5" height="16" rx="1" fill="#16181e" />
            <rect x="289" y="46" width="22" height="20" rx="2" fill="url(#steelPlateGrad)" stroke="#1a1c22" strokeWidth="1" />
            <circle cx="300" cy="56" r="2.5" fill="#16181f" stroke="#828896" strokeWidth="0.8" />
          </g>

          {/* Mast */}
          <polygon points="278,260 326,260 318,18 284,18" fill="url(#closeMastGrad)" stroke="#2d323c" strokeWidth="1" />
          <line x1="285" y1="18" x2="280" y2="260" stroke="#717887" strokeWidth="1.8" />
          <line x1="318" y1="18" x2="326" y2="260" stroke="#050608" strokeWidth="2.5" />

          {/* Cap */}
          <polygon points="280,18 322,18 301,6" fill="#4d5361" stroke="#1e2128" strokeWidth="1" />
          <polygon points="280,18 301,6 301,18" fill="#5a6170" />

          {/* Ground Wire */}
          <path d="M 285 22 L 283 80 L 281 140 L 279 260" stroke="#94a3b8" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />

          {/* Lineman Steps */}
          {STEPS.map((s, idx) => (
            <g key={`step-${idx}`}>
              <rect x={s.dx < 0 ? s.x : s.x} y={s.y - 3} width="4" height="8" rx="1" fill="#1e2129" stroke="#4b5160" strokeWidth="0.6" />
              <path
                d={`M ${s.x} ${s.y} L ${s.x + s.dx} ${s.y} L ${s.x + s.dx} ${s.y - 7}`}
                stroke="#686f7e"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default UtilityPole;
