import React from 'react';

/**
 * IsometricMath Component
 * Precision 30-degree axonometric low-profile macropad slab.
 * Represents "Simple math. Real friction."
 * Features an angled hardware console chassis housing 4 authentic mechanical
 * keycaps (+, ÷, −, ×) with realistic tapered skirts and illuminated glyphs.
 */
export function IsometricMath({ className = 'w-full h-72' }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="69 38 162 184"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        shapeRendering="geometricPrecision"
      >
        <defs>
          {/* Ground shadow radial fade */}
          <radialGradient id="padGroundFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>

          {/* Chassis top surface lighting */}
          <linearGradient id="chassisTopLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e222d" />
            <stop offset="100%" stopColor="#11131a" />
          </linearGradient>

          {/* Chassis front-left wall shade */}
          <linearGradient id="chassisLeftShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#13161f" />
            <stop offset="100%" stopColor="#0b0d12" />
          </linearGradient>

          {/* Chassis front-right wall shade */}
          <linearGradient id="chassisRightShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e1017" />
            <stop offset="100%" stopColor="#07080b" />
          </linearGradient>

          {/* Keycap top face lighting (Matte PBT keycap) */}
          <linearGradient id="keycapTopLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c3342" />
            <stop offset="100%" stopColor="#1a1e28" />
          </linearGradient>

          {/* Keycap front-left skirt shadow */}
          <linearGradient id="keycapLeftSkirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#161922" />
            <stop offset="100%" stopColor="#0d0f15" />
          </linearGradient>

          {/* Keycap front-right skirt shadow */}
          <linearGradient id="keycapRightSkirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10131a" />
            <stop offset="100%" stopColor="#08090d" />
          </linearGradient>
        </defs>

        {/* 1. Ground Shadow (Stationary, anchored under angled slab) */}
        <ellipse cx="150" cy="172" rx="60" ry="14" fill="url(#padGroundFade)" />

        {/* 2. Low-Profile Angled Chassis Body */}
        {/* Chassis Top Surface (Angled switch plate frame) */}
        <polygon
          points="150,72 224,109 150,146 76,109"
          fill="url(#chassisTopLight)"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="0.85"
          strokeLinejoin="round"
        />

        {/* Chassis Front-Left Low Wall */}
        <polygon
          points="76,109 150,146 150,164 76,127"
          fill="url(#chassisLeftShade)"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="0.85"
          strokeLinejoin="round"
        />

        {/* Chassis Front-Right Low Wall */}
        <polygon
          points="150,146 224,109 224,127 150,164"
          fill="url(#chassisRightShade)"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="0.85"
          strokeLinejoin="round"
        />

        {/* Center Vertical Corner Spine */}
        <line
          x1="150"
          y1="146"
          x2="150"
          y2="164"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />

        {/* Recessed Switch Plate Cavity Bed */}
        <polygon
          points="150,78 216,111 150,144 84,111"
          fill="#0a0c10"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* 3. The 4 Mechanical Keycaps (Drawn in Painter's Order from Back to Front) */}

        {/* --- KEYCAP 1: PLUS (+) (Top / North) --- */}
        <g>
          {/* Tapered Skirts */}
          <polygon points="124,98 150,111 150,93 132,84" fill="url(#keycapLeftSkirt)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <polygon points="150,111 176,98 168,84 150,93" fill="url(#keycapRightSkirt)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          {/* Sculpted Keycap Top */}
          <polygon
            points="150,75 168,84 150,93 132,84"
            fill="url(#keycapTopLight)"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Plus Legend (+) */}
          <line x1="143" y1="84" x2="157" y2="84" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="150" y1="78" x2="150" y2="90" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
        </g>

        {/* --- KEYCAP 2: DIVIDE (÷) (Left / West) --- */}
        <g>
          {/* Tapered Skirts */}
          <polygon points="92,114 118,127 118,109 100,100" fill="url(#keycapLeftSkirt)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <polygon points="118,127 144,114 136,100 118,109" fill="url(#keycapRightSkirt)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          {/* Sculpted Keycap Top */}
          <polygon
            points="118,91 136,100 118,109 100,100"
            fill="url(#keycapTopLight)"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Divide Legend (÷) */}
          <line x1="111" y1="100" x2="125" y2="100" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
          <circle cx="118" cy="95.5" r="1.1" fill="#ffffff" />
          <circle cx="118" cy="104.5" r="1.1" fill="#ffffff" />
        </g>

        {/* --- KEYCAP 3: MINUS (−) (Right / East) --- */}
        <g>
          {/* Tapered Skirts */}
          <polygon points="156,114 182,127 182,109 164,100" fill="url(#keycapLeftSkirt)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <polygon points="182,127 208,114 200,100 182,109" fill="url(#keycapRightSkirt)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          {/* Sculpted Keycap Top */}
          <polygon
            points="182,91 200,100 182,109 164,100"
            fill="url(#keycapTopLight)"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Minus Legend (−) */}
          <line x1="175" y1="100" x2="189" y2="100" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
        </g>

        {/* --- KEYCAP 4: MULTIPLY (×) (Bottom / South) --- */}
        <g>
          {/* Tapered Skirts */}
          <polygon points="124,130 150,143 150,125 132,116" fill="url(#keycapLeftSkirt)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <polygon points="150,143 176,130 168,116 150,125" fill="url(#keycapRightSkirt)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          {/* Sculpted Keycap Top */}
          <polygon
            points="150,107 168,116 150,125 132,116"
            fill="url(#keycapTopLight)"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Multiply Legend (×) */}
          <line x1="145" y1="111" x2="155" y2="121" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="155" y1="111" x2="145" y2="121" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
        </g>

        {/* 4. Subtle Hardware Status Dot on Front Bevel */}
        <circle cx="150" cy="155" r="0.9" fill="rgba(255, 255, 255, 0.65)" />
        <circle cx="150" cy="155" r="2.2" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.6" />
      </svg>
    </div>
  );
}

export default IsometricMath;
