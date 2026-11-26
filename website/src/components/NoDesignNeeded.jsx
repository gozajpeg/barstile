import React, { useState, useEffect } from 'react';

/**
 * NoDesignNeeded Component
 * Animated cursive handwritten annotation:
 * - Centered and significantly larger in the visual canvas
 * - Types out line-by-line in flowing cursive, pauses, deletes smoothly, and loops
 * - Authentic cursive font stack ('Segoe Script', 'Snell Roundhand', cursive)
 * - Blinking handwriting caret and dynamic hand-drawn underline
 */
export function NoDesignNeeded({ className = '' }) {
  const line1Full = "like, we mean it.";
  const line2Full = "no design needed.";

  // Animation states: 'typing-1' | 'typing-2' | 'paused' | 'deleting-2' | 'deleting-1' | 'idle'
  const [phase, setPhase] = useState('typing-1');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');

  useEffect(() => {
    let timer;

    if (phase === 'typing-1') {
      if (line1.length < line1Full.length) {
        timer = setTimeout(() => {
          setLine1(line1Full.slice(0, line1.length + 1));
        }, 55);
      } else {
        timer = setTimeout(() => setPhase('typing-2'), 180);
      }
    } else if (phase === 'typing-2') {
      if (line2.length < line2Full.length) {
        timer = setTimeout(() => {
          setLine2(line2Full.slice(0, line2.length + 1));
        }, 50);
      } else {
        timer = setTimeout(() => setPhase('paused'), 2400);
      }
    } else if (phase === 'paused') {
      timer = setTimeout(() => setPhase('deleting-2'), 300);
    } else if (phase === 'deleting-2') {
      if (line2.length > 0) {
        timer = setTimeout(() => {
          setLine2(line2.slice(0, -1));
        }, 28);
      } else {
        timer = setTimeout(() => setPhase('deleting-1'), 120);
      }
    } else if (phase === 'deleting-1') {
      if (line1.length > 0) {
        timer = setTimeout(() => {
          setLine1(line1.slice(0, -1));
        }, 25);
      } else {
        timer = setTimeout(() => setPhase('idle'), 600);
      }
    } else if (phase === 'idle') {
      timer = setTimeout(() => setPhase('typing-1'), 400);
    }

    return () => clearTimeout(timer);
  }, [phase, line1, line2]);

  const showCaretOnLine1 = phase === 'typing-1' || phase === 'deleting-1';
  const showCaretOnLine2 = phase === 'typing-2' || phase === 'paused' || phase === 'deleting-2';
  const isFullyTyped = phase === 'paused';

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center select-none pointer-events-none ${className}`}>
      <div className="flex flex-col items-center justify-center transform -rotate-2 sm:-rotate-3 px-4">
        {/* Line 1: "like, we mean it." */}
        <div className="min-h-[38px] sm:min-h-[44px] flex items-center justify-center">
          <span
            className="text-[24px] sm:text-[30px] md:text-[34px] text-zinc-400 font-medium tracking-wide drop-shadow-[0_2px_12px_rgba(255,255,255,0.06)]"
            style={{
              fontFamily: "'Segoe Script', 'Snell Roundhand', 'Bradley Hand', 'Brush Script MT', cursive, sans-serif",
              fontStyle: 'italic',
            }}
          >
            {line1 ? `"${line1}` : ''}
            {showCaretOnLine1 && (
              <span className="inline-block w-[2px] h-[22px] sm:h-[28px] bg-zinc-400 ml-1 translate-y-[2px] animate-pulse" />
            )}
          </span>
        </div>

        {/* Line 2: "no design needed." */}
        <div className="relative min-h-[44px] sm:min-h-[52px] flex items-center justify-center mt-0.5 sm:mt-1">
          <span
            className="text-[28px] sm:text-[34px] md:text-[40px] text-white font-semibold tracking-wide drop-shadow-[0_2px_16px_rgba(255,255,255,0.12)]"
            style={{
              fontFamily: "'Segoe Script', 'Snell Roundhand', 'Bradley Hand', 'Brush Script MT', cursive, sans-serif",
              fontStyle: 'italic',
            }}
          >
            {line2}
            {line2.length === line2Full.length && line1 ? '"' : ''}
            {showCaretOnLine2 && (
              <span className="inline-block w-[2.5px] h-[26px] sm:h-[32px] bg-white ml-1 translate-y-[3px] animate-pulse" />
            )}
          </span>

          {/* Hand-drawn squiggly underline that appears smoothly when fully typed */}
          <svg
            className={`absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 w-[220px] sm:w-[270px] h-[16px] pointer-events-none transition-opacity duration-300 ${
              isFullyTyped ? 'opacity-90' : 'opacity-0'
            }`}
            viewBox="0 0 270 16"
            fill="none"
          >
            <path
              d="M 10 10 C 60 6, 140 7, 260 9"
              stroke="#a1a1aa"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M 25 13 C 85 10, 165 11, 245 12"
              stroke="#71717a"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default NoDesignNeeded;
