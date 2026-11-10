import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowUpRight,
  Lock,
  Terminal,
  Code2
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Slide 1 Graphic: Real Clean Form (Non-Interactive / Invisible)             */
/* -------------------------------------------------------------------------- */
function FormGraphic() {
  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl bg-[#0d0e15] border border-white/[0.08] p-4 sm:p-6 shadow-2xl relative select-none">
      <div className="mb-3 sm:mb-4">
        <h4 className="text-sm sm:text-base font-semibold text-white">Sign in to console</h4>
      </div>

      <div className="space-y-2.5 sm:space-y-3 mb-3 sm:mb-4">
        <div>
          <label className="block text-[11px] font-medium text-zinc-300 mb-1">Email address</label>
          <div className="h-8 sm:h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 flex items-center text-xs font-mono text-zinc-300">
            alex.chen@enterprise.io
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-300 mb-1">Password</label>
          <div className="h-8 sm:h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>••••••••••••</span>
            <Lock className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="w-full h-8 sm:h-9 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-medium text-xs flex items-center justify-center transition-all"
      >
        Sign In
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Slide 2 Graphic: Clean Backend Middleware (barstileMiddleware)             */
/* -------------------------------------------------------------------------- */
function MiddlewareGraphic() {
  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-[#0d0e15] border border-white/[0.08] p-5 shadow-2xl relative select-none">
      {/* Code Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <h4 className="text-sm font-semibold text-white">server.js • Express / Fastify</h4>
        </div>
      </div>

      {/* Code Snippet */}
      <div className="rounded-xl bg-black/70 border border-white/[0.08] p-3 font-mono text-xs text-zinc-300 leading-relaxed mb-3">
        <div className="text-zinc-500">// Mount before body parsers to protect memory</div>
        <div>
          <span className="text-purple-400">import</span> &#123;{' '}
          <span className="text-emerald-400">barstileMiddleware</span> &#125;{' '}
          <span className="text-purple-400">from</span>{' '}
          <span className="text-emerald-300">'barstile/server'</span>;
        </div>
        <div className="mt-1.5">
          app.<span className="text-blue-400">use</span>(
          <span className="text-emerald-400">barstileMiddleware</span>(&#123;{' '}
          difficulty: <span className="text-amber-400">3</span> &#125;)
          );
        </div>
      </div>

      {/* Static Evaluation Overview */}
      <div className="font-mono text-[11px]">
        <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400">✓</span>
            <span>Verified Request</span>
          </div>
          <span className="text-emerald-400 font-semibold text-[10px]">
            Passed (0.1ms)
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Slide 3 Graphic: Clean Fetch Client (barstileFetch)                        */
/* -------------------------------------------------------------------------- */
function FetchGraphic() {
  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-[#0d0e15] border border-white/[0.08] p-5 shadow-2xl relative select-none">
      {/* Code Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <h4 className="text-sm font-semibold text-white">client.js • Browser & SPA</h4>
        </div>
      </div>

      {/* Code Snippet */}
      <div className="rounded-xl bg-black/70 border border-white/[0.08] p-3 font-mono text-xs text-zinc-300 leading-relaxed mb-3">
        <div className="text-zinc-500">// Drop-in replacement for native fetch()</div>
        <div>
          <span className="text-purple-400">import</span> &#123;{' '}
          <span className="text-cyan-400">barstileFetch</span> &#125;{' '}
          <span className="text-purple-400">from</span>{' '}
          <span className="text-cyan-300">'barstile/client'</span>;
        </div>
        <div className="mt-1.5">
          <span className="text-purple-400">const</span> res ={' '}
          <span className="text-purple-400">await</span>{' '}
          <span className="text-cyan-400">barstileFetch</span>(
          <span className="text-emerald-300">'/api/protected'</span>
          );
        </div>
      </div>

      {/* Off-thread execution note */}
      <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5 font-mono text-[11px] text-zinc-400 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
        <span>Solves in a background worker without blocking the main thread.</span>
      </div>
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
  const SLIDE_DURATION = 6500; // ms per slide

  // Gesture state
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragDelta = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  const slides = [
    {
      id: 'forms',
      title: 'HTML & React Forms',
      subtitle:
        'Invisible protection for forms. Zero visual puzzles, zero tracking.',
      renderGraphic: () => <FormGraphic />
    },
    {
      id: 'middleware',
      title: 'Backend Middleware',
      subtitle:
        'Intercepts scrapers before body parsers allocate heap memory.',
      renderGraphic: () => <MiddlewareGraphic />
    },
    {
      id: 'fetch',
      title: 'Drop-in Fetch Client',
      subtitle:
        'Drop-in fetch wrapper that resolves challenges off the main thread.',
      renderGraphic: () => <FetchGraphic />
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
      className="min-h-screen w-full flex flex-col justify-center py-20 select-none relative overflow-hidden"
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
        <h2 className="text-[24px] font-semibold tracking-tight text-white leading-none">
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
                className={`w-[88vw] sm:w-[76vw] md:w-[70vw] max-w-[880px] h-[480px] sm:h-[510px] shrink-0 rounded-[28px] sm:rounded-[36px] bg-[#0c0d14] p-4 sm:p-7 flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden relative ${
                  isActive
                    ? 'opacity-100 scale-100 blur-0'
                    : 'opacity-35 hover:opacity-65 scale-[0.94] blur-[3px] sm:blur-sm hover:blur-[1px] cursor-pointer'
                }`}
              >
                {/* 1. Card Top Header (Docs stays top-right on mobile & desktop) */}
                <div className="relative z-10 flex items-start justify-between gap-3 pb-3 border-b border-white/[0.08]">
                  <div className="pr-2">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-white leading-tight">
                      {slide.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 font-normal mt-1 max-w-xl leading-relaxed">
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
                  {slide.renderGraphic()}
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
          className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] backdrop-blur-md text-white/50 hover:text-white active:scale-90 flex items-center justify-center transition-all"
          title="Previous slide"
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
              >
                {/* Fluid spring stretch: morphs smoothly between w-2 and w-8 */}
                <div
                  className={`h-2 rounded-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
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
          className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] backdrop-blur-md text-white/50 hover:text-white active:scale-90 flex items-center justify-center transition-all"
          title="Next slide"
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
          className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] backdrop-blur-md text-white/50 hover:text-white active:scale-90 flex items-center justify-center transition-all ml-1"
          title={isEffectivelyPlaying ? 'Pause auto-scroll' : 'Resume auto-scroll'}
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
