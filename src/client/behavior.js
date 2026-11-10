/**
 * Barstile Passive Behavioral Dynamics Tracker
 * Captures non-invasive micro-interaction dynamics (pointer curvature, event timing jitter,
 * dwell times) to distinguish human interaction from automated scripts.
 * ZERO PII: Never records keystroke characters, coordinates of sensitive fields, or form values.
 */

/**
 * Creates an active behavior tracker instance.
 *
 * @param {Window} [win] - Window object (defaults to global window)
 * @returns {Object} Tracker controls { getTelemetry, stop, reset }
 */
export function createBehaviorTracker(win) {
  const targetWin = win || (typeof window !== 'undefined' ? window : null);
  const startTime = Date.now();

  const state = {
    pointerMoves: 0,
    linearTransitions: 0,
    curvedTransitions: 0,
    lastPoints: [], // ring buffer of last 3 points: [x, y, t]
    clicks: 0,
    clickDwellTimes: [],
    keyEvents: 0,
    keyIntervals: [],
    lastKeyTime: 0,
    touches: 0,
    scrolls: 0,
    focusChanges: 0,
    firstInteractionTime: null
  };

  if (!targetWin || !targetWin.document) {
    return {
      getTelemetry: () => ({
        active: false,
        durationMs: 0,
        moves: 0,
        curvatureRatio: 0,
        avgClickDwellMs: 0,
        avgKeyIntervalMs: 0,
        keyCount: 0,
        clickCount: 0,
        scrollCount: 0,
        touchCount: 0,
        hasInteracted: false
      }),
      stop: () => {},
      reset: () => {}
    };
  }

  function markInteraction() {
    if (!state.firstInteractionTime) {
      state.firstInteractionTime = Date.now();
    }
  }

  // Pointer movement listener with 3-point curvature calculation
  function handlePointerMove(e) {
    markInteraction();
    state.pointerMoves++;

    const x = e.clientX || 0;
    const y = e.clientY || 0;
    const t = Date.now();

    state.lastPoints.push({ x, y, t });
    if (state.lastPoints.length > 3) {
      state.lastPoints.shift();
    }

    if (state.lastPoints.length === 3) {
      const [p1, p2, p3] = state.lastPoints;
      // Calculate determinant / cross product to evaluate deviation from a straight line
      const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
      if (Math.abs(crossProduct) < 2.0) {
        // High linearity (bots interpolating straight coordinates)
        state.linearTransitions++;
      } else {
        // Natural curved path
        state.curvedTransitions++;
      }
    }
  }

  let mouseDownTime = 0;
  function handleMouseDown() {
    markInteraction();
    mouseDownTime = Date.now();
  }

  function handleMouseUp() {
    markInteraction();
    state.clicks++;
    if (mouseDownTime > 0) {
      const dwell = Date.now() - mouseDownTime;
      state.clickDwellTimes.push(dwell);
      if (state.clickDwellTimes.length > 20) state.clickDwellTimes.shift();
      mouseDownTime = 0;
    }
  }

  function handleKeyDown() {
    markInteraction();
    state.keyEvents++;
    const now = Date.now();
    if (state.lastKeyTime > 0) {
      const interval = now - state.lastKeyTime;
      state.keyIntervals.push(interval);
      if (state.keyIntervals.length > 30) state.keyIntervals.shift();
    }
    state.lastKeyTime = now;
  }

  function handleTouchStart() {
    markInteraction();
    state.touches++;
  }

  function handleScroll() {
    markInteraction();
    state.scrolls++;
  }

  function handleFocus() {
    state.focusChanges++;
  }

  // Register passive listeners
  const doc = targetWin.document;
  const opts = { passive: true, capture: true };

  targetWin.addEventListener('mousemove', handlePointerMove, opts);
  targetWin.addEventListener('mousedown', handleMouseDown, opts);
  targetWin.addEventListener('mouseup', handleMouseUp, opts);
  targetWin.addEventListener('keydown', handleKeyDown, opts);
  targetWin.addEventListener('touchstart', handleTouchStart, opts);
  targetWin.addEventListener('scroll', handleScroll, opts);
  targetWin.addEventListener('focus', handleFocus, opts);
  targetWin.addEventListener('blur', handleFocus, opts);

  function stop() {
    targetWin.removeEventListener('mousemove', handlePointerMove, opts);
    targetWin.removeEventListener('mousedown', handleMouseDown, opts);
    targetWin.removeEventListener('mouseup', handleMouseUp, opts);
    targetWin.removeEventListener('keydown', handleKeyDown, opts);
    targetWin.removeEventListener('touchstart', handleTouchStart, opts);
    targetWin.removeEventListener('scroll', handleScroll, opts);
    targetWin.removeEventListener('focus', handleFocus, opts);
    targetWin.removeEventListener('blur', handleFocus, opts);
  }

  function reset() {
    state.pointerMoves = 0;
    state.linearTransitions = 0;
    state.curvedTransitions = 0;
    state.lastPoints = [];
    state.clicks = 0;
    state.clickDwellTimes = [];
    state.keyEvents = 0;
    state.keyIntervals = [];
    state.lastKeyTime = 0;
    state.touches = 0;
    state.scrolls = 0;
    state.focusChanges = 0;
    state.firstInteractionTime = null;
  }

  function getTelemetry() {
    const now = Date.now();
    const durationMs = now - startTime;
    const totalTransitions = state.linearTransitions + state.curvedTransitions;
    const curvatureRatio = totalTransitions > 0 ? state.curvedTransitions / totalTransitions : 0;

    const avgClickDwellMs =
      state.clickDwellTimes.length > 0
        ? Math.round(state.clickDwellTimes.reduce((a, b) => a + b, 0) / state.clickDwellTimes.length)
        : 0;

    const avgKeyIntervalMs =
      state.keyIntervals.length > 0
        ? Math.round(state.keyIntervals.reduce((a, b) => a + b, 0) / state.keyIntervals.length)
        : 0;

    return {
      active: true,
      durationMs,
      timeToFirstInteractionMs: state.firstInteractionTime ? state.firstInteractionTime - startTime : null,
      hasInteracted: Boolean(state.firstInteractionTime),
      moves: state.pointerMoves,
      curvatureRatio: Number(curvatureRatio.toFixed(3)),
      linearTransitions: state.linearTransitions,
      curvedTransitions: state.curvedTransitions,
      clickCount: state.clicks,
      avgClickDwellMs,
      keyCount: state.keyEvents,
      avgKeyIntervalMs,
      touchCount: state.touches,
      scrollCount: state.scrolls,
      focusChanges: state.focusChanges
    };
  }

  return { getTelemetry, stop, reset };
}
