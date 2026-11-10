import React from 'react';

/**
 * IsometricServer Component
 * High-craft 30-degree axonometric 5U enterprise blade server.
 * Left-aligned, stationary, and physically grounded.
 * Features:
 *  - Volumetric obsidian chassis with distinct directional plane shading
 *  - Recessed lid with toolless hood latch and stamped airflow channels
 *  - 5 stacked 1U blade server bays with CNC shelf dividers
 *  - Dual hot-swap SFF drive caddies per blade with ejector latches
 *  - Micro status indicators (power emerald, I/O activity cyan, link amber)
 *  - Right-side stamped exhaust cooling louvers & dual redundant PSUs
 *  - Multi-layer grounded ambient occlusion floor shadow
 */
export function IsometricServer({ className = 'w-full h-72' }) {
  const tiers = [0, 1, 2, 3, 4];

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="50 30 200 215"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        shapeRendering="geometricPrecision"
      >
        <defs>
          {/* Ground Ambient Occlusion */}
          <radialGradient id="serverFloorAO" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#000000" stopOpacity="0.55" />
            <stop offset="75%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Top Roof Plate Brushed Metal */}
          <linearGradient id="serverRoofPlate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#242936" />
            <stop offset="50%" stopColor="#1a1e29" />
            <stop offset="100%" stopColor="#11141c" />
          </linearGradient>

          {/* Top Inset Service Lid */}
          <linearGradient id="serverRoofLid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#141720" />
            <stop offset="100%" stopColor="#0c0e14" />
          </linearGradient>

          {/* Front-Left Blade Bay Base Plate */}
          <linearGradient id="serverFrontBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#151822" />
            <stop offset="100%" stopColor="#0b0d12" />
          </linearGradient>

          {/* Side-Right Exhaust Base Plate */}
          <linearGradient id="serverSideBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e1017" />
            <stop offset="100%" stopColor="#06070a" />
          </linearGradient>

          {/* Front Center Corner Spine Chamfer */}
          <linearGradient id="serverSpineLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#cbd5e1" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.2" />
          </linearGradient>

          {/* Hot-Swap Drive Caddy Face Plate */}
          <linearGradient id="driveCaddyFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#232938" />
            <stop offset="100%" stopColor="#141721" />
          </linearGradient>

          {/* Drive Release Latch Metallic Tab */}
          <linearGradient id="driveLatchTab" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Cooling Louver Recessed Pocket */}
          <linearGradient id="louverPocket" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#050609" />
            <stop offset="100%" stopColor="#090b10" />
          </linearGradient>
        </defs>

        {/* 1. Grounded Ambient Occlusion & Floor Contact Shadow */}
        <ellipse cx="150" cy="222" rx="76" ry="17" fill="url(#serverFloorAO)" />
        <ellipse cx="150" cy="221" rx="46" ry="9" fill="#000000" opacity="0.65" />

        {/* 2. Main Chassis Exterior Solid Enclosure */}
        {/* Top Roof Surface */}
        <polygon
          points="150,42 226,80 150,118 74,80"
          fill="url(#serverRoofPlate)"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />

        {/* Top Roof Recessed Service Lid */}
        <polygon
          points="150,49 212,80 150,111 88,80"
          fill="url(#serverRoofLid)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Top Lid Stamped Airflow Channels */}
        <g stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.65" strokeLinecap="round">
          <line x1="104" y1="76" x2="136" y2="60" />
          <line x1="114" y1="85" x2="150" y2="67" />
          <line x1="126" y1="95" x2="164" y2="76" />
          <line x1="138" y1="105" x2="176" y2="86" />
        </g>

        {/* Top Lid Toolless Latch Mechanism */}
        <polygon
          points="146,78 154,74 154,78 146,82"
          fill="#334155"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="0.6"
        />

        {/* Front-Left Face (Blade Bays Enclosure) */}
        <polygon
          points="74,80 150,118 150,218 74,180"
          fill="url(#serverFrontBase)"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />

        {/* Side-Right Face (Cooling Exhaust Enclosure) */}
        <polygon
          points="150,118 226,80 226,180 150,218"
          fill="url(#serverSideBase)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />

        {/* 3. The 5 Stacked Server Blade Bays */}
        {tiers.map((i) => {
          const y = i * 20;

          return (
            <g key={`blade-tier-${i}`}>
              {/* CNC Shelf Divider Rail (Tiers 0 to 3) */}
              {i < 4 && (
                <g>
                  {/* Left Face Shelf Divider */}
                  <line
                    x1="74"
                    y1={80 + y + 19}
                    x2="150"
                    y2={118 + y + 19}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  <line
                    x1="74"
                    y1={80 + y + 20}
                    x2="150"
                    y2={118 + y + 20}
                    stroke="#040508"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />

                  {/* Right Face Shelf Divider */}
                  <line
                    x1="150"
                    y1={118 + y + 19}
                    x2="226"
                    y2={80 + y + 19}
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeWidth="0.75"
                    strokeLinecap="round"
                  />
                  <line
                    x1="150"
                    y1={118 + y + 20}
                    x2="226"
                    y2={80 + y + 20}
                    stroke="#040508"
                    strokeWidth="0.85"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* FRONT-LEFT: DRIVE CADDY 1 (Left Bay)                             */}
              {/* ---------------------------------------------------------------- */}
              {/* Drive 1 3D Face Plate */}
              <polygon
                points={`78,${84.5 + y} 108,${99.5 + y} 108,${113 + y} 78,${98 + y}`}
                fill="url(#driveCaddyFace)"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="0.7"
                strokeLinejoin="round"
              />

              {/* Drive 1 Recessed Ejector Handle */}
              <polygon
                points={`82,${90.5 + y} 104,${101.5 + y} 104,${106.5 + y} 82,${95.5 + y}`}
                fill="#0a0c11"
                stroke="rgba(255, 255, 255, 0.14)"
                strokeWidth="0.6"
              />

              {/* Drive 1 Release Latch Clip */}
              <polygon
                points={`80,${87 + y} 84,${89 + y} 84,${92 + y} 80,${90 + y}`}
                fill="url(#driveLatchTab)"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="0.5"
              />

              {/* Drive 1 Status LED (Solid Reassuring Emerald) */}
              <circle
                cx="105"
                cy={109.5 + y}
                r="1.7"
                fill="#10b981"
                opacity="0.22"
              />
              <circle
                cx="105"
                cy={109.5 + y}
                r="0.85"
                fill="#10b981"
              />

              {/* ---------------------------------------------------------------- */}
              {/* FRONT-LEFT: DRIVE CADDY 2 (Right Bay)                            */}
              {/* ---------------------------------------------------------------- */}
              {/* Drive 2 3D Face Plate */}
              <polygon
                points={`112,${101.5 + y} 142,${116.5 + y} 142,${130 + y} 112,${115 + y}`}
                fill="url(#driveCaddyFace)"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="0.7"
                strokeLinejoin="round"
              />

              {/* Drive 2 Recessed Ejector Handle */}
              <polygon
                points={`116,${107.5 + y} 138,${118.5 + y} 138,${123.5 + y} 116,${112.5 + y}`}
                fill="#0a0c11"
                stroke="rgba(255, 255, 255, 0.14)"
                strokeWidth="0.6"
              />

              {/* Drive 2 Release Latch Clip */}
              <polygon
                points={`114,${104 + y} 118,${106 + y} 118,${109 + y} 114,${107 + y}`}
                fill="url(#driveLatchTab)"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="0.5"
              />

              {/* Drive 2 I/O Activity LED (Cyan / Blue, pulsing on tiers 1 & 3) */}
              <circle
                cx="139"
                cy={126.5 + y}
                r="1.6"
                fill="#38bdf8"
                opacity={i === 1 || i === 3 ? "0.35" : "0.15"}
                className={i === 1 ? "animate-pulse" : i === 3 ? "animate-[pulse_1.8s_ease-in-out_infinite]" : ""}
              />
              <circle
                cx="139"
                cy={126.5 + y}
                r="0.8"
                fill="#38bdf8"
                opacity={i === 1 || i === 3 ? "0.95" : "0.5"}
                className={i === 1 ? "animate-pulse" : i === 3 ? "animate-[pulse_1.8s_ease-in-out_infinite]" : ""}
              />

              {/* ---------------------------------------------------------------- */}
              {/* FRONT-LEFT: BLADE CONTROL COLUMN (Near Center Spine)             */}
              {/* ---------------------------------------------------------------- */}
              {/* Unit Power Indicator LED (Pinpoint emerald) */}
              <circle
                cx="146"
                cy={121.5 + y}
                r="0.75"
                fill="#10b981"
                opacity="0.8"
              />

              {/* Unit Gigabit Link Indicator (Pinpoint amber) */}
              <circle
                cx="146"
                cy={127 + y}
                r="0.65"
                fill="#f59e0b"
                opacity="0.7"
              />

              {/* ---------------------------------------------------------------- */}
              {/* SIDE-RIGHT: EXHAUST LOUVERS (Tiers 0-3) OR REDUNDANT PSUS (Tier 4) */}
              {/* ---------------------------------------------------------------- */}
              {i < 4 ? (
                <g>
                  {/* Recessed Cooling Bay Pocket */}
                  <polygon
                    points={`159,${117 + y} 217,${88 + y} 217,${101 + y} 159,${130 + y}`}
                    fill="url(#louverPocket)"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="0.6"
                  />

                  {/* 3 Stamped Horizontal Airflow Fin Louvers */}
                  <g stroke="rgba(255, 255, 255, 0.16)" strokeWidth="0.7" strokeLinecap="round">
                    <line x1="162" y1={120.5 + y} x2="214" y2={94.5 + y} />
                    <line x1="162" y1={124 + y} x2="214" y2={98 + y} />
                    <line x1="162" y1={127.5 + y} x2="214" y2={101.5 + y} />
                  </g>
                  {/* Internal fin shadows */}
                  <g stroke="#030406" strokeWidth="0.8" strokeLinecap="round">
                    <line x1="162" y1={121.3 + y} x2="214" y2={95.3 + y} />
                    <line x1="162" y1={124.8 + y} x2="214" y2={98.8 + y} />
                    <line x1="162" y1={128.3 + y} x2="214" y2={102.3 + y} />
                  </g>
                </g>
              ) : (
                /* Tier 4 (Bottom Right): Dual Hot-Swap Power Supplies (PSU 1 & 2) */
                <g>
                  {/* PSU 1 */}
                  <polygon
                    points="158,194 186,180 186,193 158,207"
                    fill="#141822"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="0.65"
                  />
                  {/* PSU 1 Extraction Handle */}
                  <line
                    x1="162"
                    y1="202"
                    x2="174"
                    y2="196"
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  {/* PSU 1 AC OK Green LED */}
                  <circle cx="180" cy="188" r="0.75" fill="#10b981" />

                  {/* PSU 2 */}
                  <polygon
                    points="190,178 218,164 218,177 190,191"
                    fill="#141822"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="0.65"
                  />
                  {/* PSU 2 Extraction Handle */}
                  <line
                    x1="194"
                    y1="186"
                    x2="206"
                    y2="180"
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  {/* PSU 2 AC OK Green LED */}
                  <circle cx="212" cy="172" r="0.75" fill="#10b981" />
                </g>
              )}
            </g>
          );
        })}

        {/* 4. Center Front Vertical Corner Spine (Key Light Highlight) */}
        <line
          x1="150"
          y1="118"
          x2="150"
          y2="218"
          stroke="url(#serverSpineLight)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />

        {/* Top Front Left Chamfer Highlight */}
        <line
          x1="74"
          y1="80"
          x2="150"
          y2="118"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />

        {/* Top Front Right Chamfer Highlight */}
        <line
          x1="150"
          y1="118"
          x2="226"
          y2="80"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="0.85"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default IsometricServer;
