import React from 'react';

/**
 * UtilityPole Component
 * Minimalist architectural utility pole mast:
 * - Clean vertical mast rising along the right edge with climbing pegs and cap
 * - Dual horizontal crossarms with steel diagonal inverted-V braces
 * - Stripped clean of all wires, connectors/insulators, and transformer cans
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
        </defs>

        {/* ============================================================== */}
        {/* 1. DUAL CROSSARMS & INVERTED V-BRACING                         */}
        {/* ============================================================== */}
        {/* Inverted V Diagonal Steel Braces */}
        <line x1="235" y1="68" x2="280" y2="98" stroke="#484c58" strokeWidth="2" strokeLinecap="round" />
        <line x1="325" y1="68" x2="280" y2="98" stroke="#484c58" strokeWidth="2" strokeLinecap="round" />
        <circle cx="280" cy="98" r="2.5" fill="#1c1d23" stroke="#5a5e6d" strokeWidth="0.75" />

        {/* Lower Crossarm */}
        <rect x="228" y="64" width="104" height="7.5" rx="1" fill="url(#crossarmGrad)" stroke="#4a4e5b" strokeWidth="0.6" />
        {/* Upper Crossarm */}
        <rect x="238" y="34" width="84" height="7" rx="1" fill="url(#crossarmGrad)" stroke="#4a4e5b" strokeWidth="0.6" />

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
      </svg>
    </div>
  );
}

export default UtilityPole;
