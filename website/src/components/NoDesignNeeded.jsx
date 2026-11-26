import React, { useState, useEffect } from 'react';

const SCRIPT_FONT = {
  fontFamily: "'Segoe Script', 'Snell Roundhand', 'Bradley Hand', 'Brush Script MT', cursive, sans-serif",
  fontStyle: 'italic',
};

const LINE1_FULL = "like, we mean it.";
const LINE2_FULL = "no design needed.";
const TOTAL_CHARS = LINE1_FULL.length + LINE2_FULL.length;

export function NoDesignNeeded({ className = '' }) {
  const [count, setCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer;

    if (isPaused) {
      timer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 2400);
    } else if (!isDeleting) {
      if (count < TOTAL_CHARS) {
        timer = setTimeout(() => setCount(c => c + 1), count < LINE1_FULL.length ? 55 : 50);
      } else {
        setIsPaused(true);
      }
    } else {
      if (count > 0) {
        timer = setTimeout(() => setCount(c => c - 1), 26);
      } else {
        timer = setTimeout(() => setIsDeleting(false), 800);
      }
    }

    return () => clearTimeout(timer);
  }, [count, isDeleting, isPaused]);

  const line1Len = Math.min(count, LINE1_FULL.length);
  const line2Len = Math.max(0, count - LINE1_FULL.length);
  const line1 = LINE1_FULL.slice(0, line1Len);
  const line2 = LINE2_FULL.slice(0, line2Len);

  const caretOn1 = count < LINE1_FULL.length;
  const caretOn2 = count >= LINE1_FULL.length && (!isPaused || isDeleting);
  const isFull = count === TOTAL_CHARS;

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center select-none pointer-events-none ${className}`}>
      <div className="flex flex-col items-center justify-center transform -rotate-2 sm:-rotate-3 px-4" style={SCRIPT_FONT}>
        {/* Line 1 */}
        <div className="min-h-[38px] sm:min-h-[44px] flex items-center justify-center">
          <span className="text-[24px] sm:text-[30px] md:text-[34px] text-zinc-400 font-medium tracking-wide drop-shadow-[0_2px_12px_rgba(255,255,255,0.06)]">
            {line1 ? `"${line1}` : ''}
            {caretOn1 && <span className="inline-block w-[2px] h-[22px] sm:h-[28px] bg-zinc-400 ml-1 translate-y-[2px] animate-pulse" />}
          </span>
        </div>

        {/* Line 2 */}
        <div className="relative min-h-[44px] sm:min-h-[52px] flex items-center justify-center mt-0.5 sm:mt-1">
          <span className="text-[28px] sm:text-[34px] md:text-[40px] text-white font-semibold tracking-wide drop-shadow-[0_2px_16px_rgba(255,255,255,0.12)]">
            {line2}
            {line2Len === LINE2_FULL.length && line1 ? '"' : ''}
            {caretOn2 && <span className="inline-block w-[2.5px] h-[26px] sm:h-[32px] bg-white ml-1 translate-y-[3px] animate-pulse" />}
          </span>

          {/* Underline */}
          <svg
            className={`absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 w-[220px] sm:w-[270px] h-[16px] pointer-events-none transition-opacity duration-300 ${isFull ? 'opacity-90' : 'opacity-0'}`}
            viewBox="0 0 270 16"
            fill="none"
          >
            <path d="M 10 10 C 60 6, 140 7, 260 9" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default NoDesignNeeded;
