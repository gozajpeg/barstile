import React from 'react';

/**
 * NoDesignNeeded Component
 * Casual hand-drawn cursive annotation for the combined "Zero cookies. No analytics." card.
 * Self-aware developer humor: literally no design, no tracking, just an honest handwritten note.
 */
export function NoDesignNeeded({ className = '' }) {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 320 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[280px] sm:max-w-[310px] overflow-visible"
      >
        <g transform="rotate(-4 160 80)">
          {/* Handwritten text */}
          <text
            x="140"
            y="65"
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize="19"
            style={{
              fontFamily: "'Segoe Print', 'Bradley Hand', 'Caveat', 'Comic Sans MS', cursive, sans-serif",
              fontStyle: 'italic',
              letterSpacing: '0.02em',
            }}
          >
            "like, we mean it.
          </text>
          <text
            x="155"
            y="95"
            textAnchor="middle"
            fill="#e4e4e7"
            fontSize="21"
            fontWeight="bold"
            style={{
              fontFamily: "'Segoe Print', 'Bradley Hand', 'Caveat', 'Comic Sans MS', cursive, sans-serif",
              fontStyle: 'italic',
              letterSpacing: '0.03em',
            }}
          >
            no design needed."
          </text>

          {/* Hand-drawn casual underline under "no design needed" */}
          <path
            d="M 55 110 C 110 106, 190 108, 255 106"
            stroke="#71717a"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 68 114 C 120 111, 185 112, 240 111"
            stroke="#52525b"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Playful hand-drawn curly arrow pointing into the empty void */}
          <path
            d="M 262 100 C 278 95, 292 105, 288 120 C 284 134, 268 135, 258 130 C 248 125, 242 110, 235 90 C 230 75, 225 60, 220 52"
            stroke="#a1a1aa"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="1 1"
            fill="none"
          />
          {/* Arrowhead */}
          <path
            d="M 214 58 L 220 52 L 228 56"
            stroke="#a1a1aa"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}

export default NoDesignNeeded;
