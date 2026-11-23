import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowUpRight,
  Lock,
  Check
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Slide 1 Graphic: Animated Form with Fluid Mouse Click & Success (5s Cycle)  */
/* -------------------------------------------------------------------------- */
function FormGraphic({ isActive }) {
  // Step: 0: idle, 1: mouse moving, 2: mouse clicking, 3: verifying, 4: success, 5: resetting
  const [step, setStep] = useState(0);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setStep(0);
      setIsClicked(false);
      return;
    }

    let isMounted = true;
    const timeouts = [];

    const runCycle = () => {
      if (!isMounted) return;
      setStep(0);
      setIsClicked(false);

      // 250ms: mouse fades in and glides towards the button
      timeouts.push(
        setTimeout(() => {
          if (isMounted) setStep(1);
        }, 250)
      );

      // 1600ms: mouse clicks down
      timeouts.push(
        setTimeout(() => {
          if (isMounted) {
            setStep(2);
            setIsClicked(true);
          }
        }, 1600)
      );

      // 1850ms: mouse lifts & fades out, challenge verifies
      timeouts.push(
        setTimeout(() => {
          if (isMounted) {
            setStep(3);
            setIsClicked(false);
          }
        }, 1850)
      );

      // 2150ms: signed in successfully!
      timeouts.push(
        setTimeout(() => {
          if (isMounted) setStep(4);
        }, 2150)
      );

      // 4400ms: begin resetting back to idle
      timeouts.push(
        setTimeout(() => {
          if (isMounted) setStep(5);
        }, 4400)
      );

      // 5000ms: restart cycle if still active
      timeouts.push(
        setTimeout(() => {
          if (isMounted) runCycle();
        }, 5000)
      );
    };

    runCycle();

    return () => {
      isMounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, [isActive]);

  const isSuccess = step === 4;

  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl bg-[#0d0e15] border border-white/[0.08] p-4 sm:p-6 shadow-2xl relative select-none">
      <div className="mb-3 sm:mb-4">
        <h4 className="text-sm sm:text-base font-semibold text-white">Sign in to console</h4>
      </div>

      <div className="space-y-2.5 sm:space-y-3 mb-3 sm:mb-4">
        <div>
          <label className="block text-[11px] font-medium text-zinc-300 mb-1">Email address</label>
          <div
            className={`h-8 sm:h-9 rounded-xl border px-3 flex items-center text-xs font-mono transition-all duration-500 ${isSuccess
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
              : 'bg-white/[0.03] border-white/[0.08] text-zinc-300'
              }`}
          >
            alex.chen@enterprise.io
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-300 mb-1">Password</label>
          <div
            className={`h-8 sm:h-9 rounded-xl border px-3 flex items-center justify-between text-xs font-mono transition-all duration-500 ${isSuccess
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
              : 'bg-white/[0.03] border-white/[0.08] text-zinc-500'
              }`}
          >
            <span>••••••••••••</span>
            <Lock
              className={`w-3.5 h-3.5 transition-colors duration-500 ${isSuccess ? 'text-emerald-400' : 'text-zinc-500'
                }`}
            />
          </div>
        </div>
      </div>

      {/* Button with animated fluid mouse cursor */}
      <div className="relative w-full">
        <button
          type="button"
          tabIndex={-1}
          className={`w-full h-8 sm:h-9 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all duration-300 ${step === 2
            ? 'bg-zinc-200 text-zinc-950 scale-[0.97]'
            : step === 3
              ? 'bg-zinc-100 text-zinc-900 scale-100'
              : step === 4
                ? 'bg-emerald-500 text-white font-semibold scale-[1.01] shadow-[0_0_24px_rgba(16,185,129,0.35)]'
                : 'bg-white text-zinc-950 hover:bg-zinc-200 scale-100'
            }`}
        >
          {step === 3 ? (
            <>
              <span className="w-3 h-3 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
              <span>Verifying...</span>
            </>
          ) : step === 4 ? (
            <>
              <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              <span>Signed In</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>

        {/* Fluid Simulated Cursor Pointer */}
        <div
          className="pointer-events-none absolute z-20 top-1/2 left-1/2"
          style={{
            transform: `translate(calc(-50% + ${step === 0 || step === 5 ? 48 : -6
              }px), calc(-50% + ${step === 0 || step === 5 ? 36 : -2
              }px)) scale(${step === 2 ? 0.82 : 1})`,
            opacity: step === 1 || step === 2 ? 1 : 0,
            transitionProperty: 'transform, opacity',
            transitionDuration:
              step === 1
                ? '1200ms'
                : step === 2
                  ? '120ms'
                  : step === 3
                    ? '250ms'
                    : '300ms',
            transitionTimingFunction:
              step === 1 ? 'cubic-bezier(0.16, 1, 0.3, 1)' : 'ease-out'
          }}
        >
          <svg
            className="w-5 h-5 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] filter"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"
              fill="white"
              stroke="#0a0b10"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>

          {/* Click Ripple Wave */}
          {isClicked && (
            <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full border border-white/60 bg-white/20 animate-ping pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Slide 2 Graphic: Clean Backend Middleware with Live Typing Animation (5s)   */
/* -------------------------------------------------------------------------- */
const MIDDLEWARE_CODE_LINES = [
  {
    startIndex: 0,
    length: 47,
    tokens: [
      { text: '// Mount before body parsers to protect memory', className: 'text-zinc-500' }
    ]
  },
  {
    startIndex: 47,
    length: 53,
    tokens: [
      { text: 'import', className: 'text-purple-400' },
      { text: ' { ', className: 'text-zinc-300' },
      { text: 'barstileMiddleware', className: 'text-emerald-400' },
      { text: ' } ', className: 'text-zinc-300' },
      { text: 'from', className: 'text-purple-400' },
      { text: " 'barstile/server';", className: 'text-emerald-300' }
    ]
  },
  {
    startIndex: 100,
    length: 47,
    tokens: [
      { text: 'app.', className: 'text-zinc-300' },
      { text: 'use', className: 'text-blue-400' },
      { text: '(', className: 'text-zinc-300' },
      { text: 'barstileMiddleware', className: 'text-emerald-400' },
      { text: '({ difficulty: ', className: 'text-zinc-300' },
      { text: '3', className: 'text-amber-400' },
      { text: ' }));', className: 'text-zinc-300' }
    ]
  }
];

const TOTAL_CODE_CHARS = 147;

function MiddlewareGraphic({ isActive }) {
  const [typedChars, setTypedChars] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setTypedChars(0);
      return;
    }

    let isMounted = true;
    let startTime = Date.now();

    const interval = setInterval(() => {
      if (!isMounted) return;
      const elapsed = Date.now() - startTime;

      if (elapsed >= 5000) {
        startTime = Date.now();
        setTypedChars(0);
        return;
      }

      let count = 0;
      if (elapsed < 300) {
        count = 0;
      } else if (elapsed < 1000) {
        const p = (elapsed - 300) / 700;
        count = Math.floor(p * 47);
      } else if (elapsed < 1200) {
        count = 47;
      } else if (elapsed < 2300) {
        const p = (elapsed - 1200) / 1100;
        count = 47 + Math.floor(p * 53);
      } else if (elapsed < 2500) {
        count = 100;
      } else if (elapsed < 3500) {
        const p = (elapsed - 2500) / 1000;
        count = 100 + Math.floor(p * 47);
      } else {
        count = TOTAL_CODE_CHARS;
      }

      setTypedChars(count);
    }, 25);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isActive]);

  return (
    <div className="w-full max-w-fit mx-auto px-2 sm:px-6 font-mono text-[11px] sm:text-[14px] md:text-[16px] lg:text-[18px] text-zinc-300 leading-relaxed sm:leading-[1.8] select-none text-left">
      {MIDDLEWARE_CODE_LINES.map((line, lineIdx) => {
        if (typedChars < line.startIndex) {
          return (
            <div key={lineIdx} className={`${lineIdx > 0 ? 'mt-1.5 sm:mt-2' : ''} invisible select-none`}>
              &nbsp;
            </div>
          );
        }

        const lineChars = Math.min(typedChars - line.startIndex, line.length);
        const isCurrentActiveLine =
          typedChars >= line.startIndex &&
          (typedChars < line.startIndex + line.length || lineIdx === MIDDLEWARE_CODE_LINES.length - 1);

        let currentOffset = 0;

        return (
          <div key={lineIdx} className={`${lineIdx > 0 ? 'mt-1.5 sm:mt-2' : ''} whitespace-pre-wrap sm:whitespace-pre`}>
            {line.tokens.map((token, tokenIdx) => {
              const tokenStart = currentOffset;
              const tokenEnd = currentOffset + token.text.length;
              currentOffset = tokenEnd;

              if (lineChars <= tokenStart) return null;

              const visibleText =
                lineChars >= tokenEnd
                  ? token.text
                  : token.text.slice(0, lineChars - tokenStart);

              return (
                <span key={tokenIdx} className={token.className}>
                  {visibleText}
                </span>
              );
            })}

            {/* Responsive Blinking Cursor */}
            {isCurrentActiveLine && (
              <span className="inline-block w-[2px] sm:w-[3px] h-[1.15em] bg-emerald-400 ml-1 animate-pulse align-middle" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Slide 3 Graphic: Distributed Redis Cluster with Live Typing Animation (5s) */
/* -------------------------------------------------------------------------- */
const CLUSTER_CODE_LINES = [
  {
    startIndex: 0,
    length: 47,
    tokens: [
      { text: '// Sync challenge nonces across horizontal pods', className: 'text-zinc-500' }
    ]
  },
  {
    startIndex: 47,
    length: 47,
    tokens: [
      { text: 'import', className: 'text-purple-400' },
      { text: ' { ', className: 'text-zinc-300' },
      { text: 'barstileMiddleware', className: 'text-emerald-400' },
      { text: ', ', className: 'text-zinc-300' },
      { text: 'RedisReplayStore', className: 'text-rose-400' },
      { text: ' }', className: 'text-zinc-300' }
    ]
  },
  {
    startIndex: 94,
    length: 25,
    tokens: [
      { text: 'from', className: 'text-purple-400' },
      { text: ' ', className: 'text-zinc-300' },
      { text: "'barstile/server';", className: 'text-emerald-300' }
    ]
  },
  {
    startIndex: 119,
    length: 28,
    tokens: [
      { text: 'app.', className: 'text-zinc-300' },
      { text: 'use', className: 'text-blue-400' },
      { text: '(', className: 'text-zinc-300' },
      { text: 'barstileMiddleware', className: 'text-emerald-400' },
      { text: '({', className: 'text-zinc-300' }
    ]
  },
  {
    startIndex: 147,
    length: 40,
    tokens: [
      { text: 'replayStore: ', className: 'text-zinc-300' },
      { text: 'new', className: 'text-purple-400' },
      { text: ' ', className: 'text-zinc-300' },
      { text: 'RedisReplayStore', className: 'text-rose-400' },
      { text: '(redis)', className: 'text-zinc-300' }
    ]
  },
  {
    startIndex: 187,
    length: 4,
    tokens: [
      { text: '}));', className: 'text-zinc-300' }
    ]
  }
];

const TOTAL_CLUSTER_CHARS = 191;

function ClusterGraphic({ isActive }) {
  const [typedChars, setTypedChars] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setTypedChars(0);
      return;
    }

    let isMounted = true;
    let startTime = Date.now();

    const interval = setInterval(() => {
      if (!isMounted) return;
      const elapsed = Date.now() - startTime;

      if (elapsed >= 5000) {
        startTime = Date.now();
        setTypedChars(0);
        return;
      }

      let count = 0;
      if (elapsed < 250) {
        count = 0;
      } else if (elapsed < 850) {
        const p = (elapsed - 250) / 600;
        count = Math.floor(p * 47);
      } else if (elapsed < 950) {
        count = 47;
      } else if (elapsed < 1650) {
        const p = (elapsed - 950) / 700;
        count = 47 + Math.floor(p * 47);
      } else if (elapsed < 1750) {
        count = 94;
      } else if (elapsed < 2150) {
        const p = (elapsed - 1750) / 400;
        count = 94 + Math.floor(p * 25);
      } else if (elapsed < 2300) {
        count = 119;
      } else if (elapsed < 2750) {
        const p = (elapsed - 2300) / 450;
        count = 119 + Math.floor(p * 28);
      } else if (elapsed < 3350) {
        const p = (elapsed - 2750) / 600;
        count = 147 + Math.floor(p * 40);
      } else if (elapsed < 3500) {
        const p = (elapsed - 3350) / 150;
        count = 187 + Math.floor(p * 4);
      } else {
        count = TOTAL_CLUSTER_CHARS;
      }

      setTypedChars(count);
    }, 25);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isActive]);

  return (
    <div className="w-full max-w-fit mx-auto px-2 sm:px-6 font-mono text-[10px] xs:text-[11px] sm:text-[13px] md:text-[15px] lg:text-[17px] xl:text-[18px] text-zinc-300 leading-relaxed sm:leading-[1.8] select-none text-left">
      {CLUSTER_CODE_LINES.map((line, lineIdx) => {
        if (typedChars < line.startIndex) {
          return (
            <div
              key={lineIdx}
              className={`${
                lineIdx > 0
                  ? lineIdx === 2 || lineIdx === 4
                    ? 'pl-4 sm:pl-6 mt-1 sm:mt-1.5'
                    : 'mt-1 sm:mt-1.5'
                  : ''
              } invisible select-none`}
            >
              &nbsp;
            </div>
          );
        }

        const lineChars = Math.min(typedChars - line.startIndex, line.length);
        const isCurrentActiveLine =
          typedChars >= line.startIndex &&
          (typedChars < line.startIndex + line.length || lineIdx === CLUSTER_CODE_LINES.length - 1);

        let currentOffset = 0;

        return (
          <div
            key={lineIdx}
            className={`${
              lineIdx > 0
                ? lineIdx === 2 || lineIdx === 4
                  ? 'pl-4 sm:pl-6 mt-1 sm:mt-1.5'
                  : 'mt-1 sm:mt-1.5'
                : ''
            } whitespace-nowrap`}
          >
            {line.tokens.map((token, tokenIdx) => {
              const tokenStart = currentOffset;
              const tokenEnd = currentOffset + token.text.length;
              currentOffset = tokenEnd;

              if (lineChars <= tokenStart) return null;

              const visibleText =
                lineChars >= tokenEnd
                  ? token.text
                  : token.text.slice(0, lineChars - tokenStart);

              return (
                <span key={tokenIdx} className={token.className}>
                  {visibleText}
                </span>
              );
            })}

            {/* Responsive Blinking Cursor */}
            {isCurrentActiveLine && (
              <span className="inline-block w-[2px] sm:w-[3px] h-[1.15em] bg-rose-400 ml-1 animate-pulse align-middle" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main CapabilitiesCarousel Component (3 Real Modes)                         */
/* -------------------------------------------------------------------------- */
export function CapabilitiesCarousel({
  onNavigate,
  activeIndex: externalIndex,
  onActiveIndexChange
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = externalIndex !== undefined ? externalIndex : internalIndex;

  const setActiveIndex = useCallback(
    (index) => {
      if (onActiveIndexChange) {
        onActiveIndexChange(index);
      } else {
        setInternalIndex(index);
      }
    },
    [onActiveIndexChange]
  );

  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isManualPause, setIsManualPause] = useState(false);
  const isEffectivelyPlaying = isInView && !isManualPause;

  // Viewport intersection observer: stops by default, only plays when in viewport
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.25 // Activates when 25% of the carousel section is in viewport
      }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const [progress, setProgress] = useState(0);
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const SLIDE_DURATION = 5000; // ms per slide

  // Gesture state
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragDelta = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  const slides = [
    {
      id: 'forms',
      title: 'Frontend Forms',
      subtitle:
        'Protects endpoints exposed in your frontend forms, with no visual puzzles.',
      renderGraphic: (isActive) => <FormGraphic isActive={isActive} />
    },
    {
      id: 'middleware',
      title: 'Backend Middleware',
      subtitle:
        'Verifies the math-based PoW solution before your database or backend queries run.',
      renderGraphic: (isActive) => <MiddlewareGraphic isActive={isActive} />
    },
    {
      id: 'cluster',
      title: 'Cluster Scaling',
      subtitle:
        'Redis replay protection to stop token reuse across horizontal containers and server fleets.',
      renderGraphic: (isActive) => <ClusterGraphic isActive={isActive} />
    }
  ];

  // Mathematical center calculation: completely independent of DOM offsetParent bugs!
  const updateTrackPosition = useCallback(() => {
    if (!trackRef.current || !containerRef.current) return;
    const cards = trackRef.current.children;
    if (!cards || cards.length === 0) return;

    const containerWidth = containerRef.current.offsetWidth;
    const firstCard = cards[0];
    const cardWidth = firstCard.offsetWidth || 880;
    const gap = 24; // gap-6 is 24px

    // Exact formula: card activeIndex sits precisely in the center of containerWidth
    const targetTranslate =
      (containerWidth - cardWidth) / 2 - activeIndex * (cardWidth + gap);

    trackRef.current.style.transform = `translateX(${targetTranslate + dragOffset}px)`;
  }, [activeIndex, dragOffset]);

  useEffect(() => {
    updateTrackPosition();
    window.addEventListener('resize', updateTrackPosition);
    return () => window.removeEventListener('resize', updateTrackPosition);
  }, [updateTrackPosition]);

  // Pointer drag gestures
  const handlePointerDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragDelta.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const delta = clientX - dragStartX.current;
    dragDelta.current = delta;
    setDragOffset(delta);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = dragDelta.current;
    setDragOffset(0);

    if (delta > 45) {
      setActiveIndex(activeIndex === 0 ? slides.length - 1 : activeIndex - 1);
    } else if (delta < -45) {
      setActiveIndex((activeIndex + 1) % slides.length);
    }
  };

  // Continuous progress bar animation synchronized with auto-play
  useEffect(() => {
    if (!isEffectivelyPlaying) return;

    setProgress(0);
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);

      if (elapsed >= SLIDE_DURATION) {
        clearInterval(interval);
        setActiveIndex((activeIndex + 1) % slides.length);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [isEffectivelyPlaying, activeIndex, setActiveIndex, slides.length]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex(activeIndex === 0 ? slides.length - 1 : activeIndex - 1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((activeIndex + 1) % slides.length);
  };

  return (
    <section
      id="capabilities"
      ref={sectionRef}
      className="min-h-screen w-full flex flex-col justify-center py-20 select-none relative overflow-hidden content-lazy"
    >
      {/* Background Ambient Glow: Floor Lighting facing down from middle (top has no glow) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* 1. DESKTOP SVG */}
        <svg
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="hidden md:block w-full h-full overflow-visible"
          shapeRendering="geometricPrecision"
        >
          <defs>
            {/* Top & Bottom Cutoff Mask:
                - 0% to 46%: strictly #000000 (top has NO glow)
                - 46% to 82%: smooth ramp up to peak floor lighting
                - 85% to 100%: smooth decay back to #000000 (seamless dissolve into FAQ, zero hard cut) */}
            <mask id="floorLightMaskDesktop">
              <linearGradient id="downwardMaskLinearDesktop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#000000" />
                <stop offset="46%" stopColor="#000000" />
                <stop offset="62%" stopColor="#666666" />
                <stop offset="80%" stopColor="#ffffff" />
                <stop offset="88%" stopColor="#aaaaaa" />
                <stop offset="95%" stopColor="#333333" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              <rect x="0" y="0" width="1920" height="1080" fill="url(#downwardMaskLinearDesktop)" />
            </mask>

            {/* Downward Radial Bloom facing the floor from the middle */}
            <radialGradient
              id="carouselFloorDownlightDesktop"
              cx="960"
              cy="900"
              r="950"
              fx="960"
              fy="800"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(1 0 0 0.52 0 432)"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="25%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="52%" stopColor="#ffffff" stopOpacity="0.10" />
              <stop offset="78%" stopColor="#ffffff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            {/* Wide Floor Wash grounding the section base and controls, decaying before the boundary */}
            <radialGradient
              id="carouselFloorWashDesktop"
              cx="960"
              cy="950"
              r="1100"
              fx="960"
              fy="900"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(1 0 0 0.38 0 589)"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="30%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="85%" stopColor="#ffffff" stopOpacity="0.01" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            {/* Subtle film grain filter matching HeroArc & FooterWave texture */}
            <filter id="carouselGlowGrainDesktop" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.75"
                numOctaves="3"
                stitchTiles="stitch"
                result="rawNoise"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 1
                        0 0 0 0 1
                        0 0 0 0 1
                        0 0 0 0.16 0"
                result="whiteGrain"
              />
              <feComposite
                in="whiteGrain"
                in2="SourceGraphic"
                operator="in"
                result="maskedGrain"
              />
              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="maskedGrain" />
              </feMerge>
            </filter>
          </defs>

          {/* Masked downward lighting on the floor with fine analog film grain */}
          <g mask="url(#floorLightMaskDesktop)" filter="url(#carouselGlowGrainDesktop)">
            <rect
              x="0"
              y="0"
              width="1920"
              height="1080"
              fill="url(#carouselFloorDownlightDesktop)"
            />
            <rect
              x="0"
              y="0"
              width="1920"
              height="1080"
              fill="url(#carouselFloorWashDesktop)"
            />
          </g>
        </svg>

        {/* 2. MOBILE SVG (Un-squished circular proportions for narrow viewports) */}
        <svg
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block md:hidden w-full h-full overflow-visible"
          shapeRendering="geometricPrecision"
        >
          <defs>
            <mask id="floorLightMaskMobile">
              <linearGradient id="downwardMaskLinearMobile" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#000000" />
                <stop offset="46%" stopColor="#000000" />
                <stop offset="62%" stopColor="#666666" />
                <stop offset="80%" stopColor="#ffffff" />
                <stop offset="88%" stopColor="#aaaaaa" />
                <stop offset="95%" stopColor="#333333" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              <rect x="0" y="0" width="1920" height="1080" fill="url(#downwardMaskLinearMobile)" />
            </mask>

            <radialGradient
              id="carouselFloorDownlightMobile"
              cx="960"
              cy="900"
              r="850"
              fx="960"
              fy="800"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(1 0 0 0.60 0 360)"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.30" />
              <stop offset="25%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="85%" stopColor="#ffffff" stopOpacity="0.01" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            <radialGradient
              id="carouselFloorWashMobile"
              cx="960"
              cy="950"
              r="950"
              fx="960"
              fy="900"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(1 0 0 0.45 0 522)"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.20" />
              <stop offset="30%" stopColor="#ffffff" stopOpacity="0.10" />
              <stop offset="65%" stopColor="#ffffff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            <filter id="carouselGlowGrainMobile" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.75"
                numOctaves="3"
                stitchTiles="stitch"
                result="rawNoise"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 1
                        0 0 0 0 1
                        0 0 0 0 1
                        0 0 0 0.16 0"
                result="whiteGrain"
              />
              <feComposite
                in="whiteGrain"
                in2="SourceGraphic"
                operator="in"
                result="maskedGrain"
              />
              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="maskedGrain" />
              </feMerge>
            </filter>
          </defs>

          <g mask="url(#floorLightMaskMobile)" filter="url(#carouselGlowGrainMobile)">
            <rect
              x="0"
              y="0"
              width="1920"
              height="1080"
              fill="url(#carouselFloorDownlightMobile)"
            />
            <rect
              x="0"
              y="0"
              width="1920"
              height="1080"
              fill="url(#carouselFloorWashMobile)"
            />
          </g>
        </svg>
      </div>

      {/* Section Top Heading */}
      <div className="relative z-10 mb-12 text-center px-6 max-w-4xl mx-auto">
        <h2 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-none">
          Built for every layer of your stack.
        </h2>
      </div>

      {/* Outer Reel Track with Peeking Margins & Gesture Drag */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full relative z-10 overflow-hidden py-4 cursor-grab active:cursor-grabbing touch-pan-y"
      >
        <div
          ref={trackRef}
          className="flex gap-6 will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: 'max-content' }}
        >
          {slides.map((slide, idx) => {
            const isActive = activeIndex === idx;

            return (
              <div
                key={slide.id}
                onClick={() => {
                  if (Math.abs(dragDelta.current) < 15) {
                    setActiveIndex(idx);
                  }
                }}
                className={`w-[88vw] sm:w-[76vw] md:w-[70vw] max-w-[880px] h-[520px] sm:h-[560px] shrink-0 rounded-[28px] sm:rounded-[36px] bg-[#0c0d14] p-4 sm:p-7 flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden relative ${isActive
                  ? 'opacity-100 scale-100 blur-0'
                  : 'opacity-35 hover:opacity-65 scale-[0.94] blur-[3px] sm:blur-sm hover:blur-[1px] cursor-pointer'
                  }`}
              >
                {/* 1. Card Top Header (Docs stays top-right on mobile & desktop) */}
                <div className="relative z-10 flex items-start justify-between gap-3 pb-3">
                  <div className="pr-2">
                    <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                      {slide.title}
                    </h3>
                    <p className="text-[20px] sm:text-[24px] text-zinc-400 font-normal mt-1 max-w-xl leading-normal">
                      {slide.subtitle}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigate) {
                          onNavigate('docs');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-medium transition-all active:scale-95 flex items-center gap-1 shadow-sm whitespace-nowrap"
                    >
                      <span>Docs</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Card Centerpiece: Fully visible on both mobile and desktop */}
                <div className="relative z-10 flex-1 w-full flex items-center justify-center my-auto py-2">
                  {slide.renderGraphic(isActive)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Apple-style Fluid Controls (Free-floating fluid dots + standalone button containers) */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-8 select-none">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] backdrop-blur-md text-white/50 hover:text-white active:scale-90 flex items-center justify-center transition-all cursor-pointer"
          title="Previous slide"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Fluid Apple Pagination Dots (Floating freely with NO outer pill box) */}
        <div className="flex items-center gap-2.5 px-1">
          {slides.map((slide, idx) => {
            const isActive = activeIndex === idx;

            return (
              <button
                key={slide.id}
                onClick={() => setActiveIndex(idx)}
                className="flex items-center h-4 focus:outline-none group cursor-pointer"
                title={`Go to ${slide.title}`}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
              >
                {/* Fluid spring stretch: morphs smoothly between w-2 and w-8 */}
                <div
                  className={`h-2 rounded-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive
                    ? 'w-8 bg-white/20'
                    : 'w-2 bg-white/30 hover:bg-white/60 group-hover:scale-110'
                    }`}
                >
                  {/* Fluid progress fill when active */}
                  {isActive && (
                    <div
                      className="h-full bg-white rounded-full will-change-transform"
                      style={{
                        width: `${isEffectivelyPlaying ? progress : (progress > 0 ? progress : 0)}%`,
                        transition: isEffectivelyPlaying ? 'width 35ms linear' : 'width 300ms ease'
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] backdrop-blur-md text-white/50 hover:text-white active:scale-90 flex items-center justify-center transition-all cursor-pointer"
          title="Next slide"
          aria-label="Next slide"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Standalone Play/Pause Container */}
        <button
          onClick={() => {
            if (isEffectivelyPlaying) {
              setIsManualPause(true);
            } else {
              setIsManualPause(false);
            }
          }}
          className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] backdrop-blur-md text-white/50 hover:text-white active:scale-90 flex items-center justify-center transition-all ml-1 cursor-pointer"
          title={isEffectivelyPlaying ? 'Pause autoplay' : 'Play autoplay'}
          aria-label={isEffectivelyPlaying ? 'Pause carousel autoplay' : 'Play carousel autoplay'}
        >
          {isEffectivelyPlaying ? (
            <Pause className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3 ml-0.5 fill-current" />
          )}
        </button>
      </div>
    </section>
  );
}

export default CapabilitiesCarousel;
