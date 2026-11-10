import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { createBehaviorTracker } from '../src/client/behavior.js';

describe('Passive Behavioral Dynamics Tracker', () => {
  test('returns inactive fallback when window or document is absent', () => {
    const tracker = createBehaviorTracker(null);
    const telemetry = tracker.getTelemetry();
    assert.equal(telemetry.active, false);
    assert.equal(telemetry.hasInteracted, false);
    tracker.stop();
  });

  test('captures pointer movements and calculates curvature variance', () => {
    const listeners = {};
    const mockWin = {
      document: {},
      addEventListener: (evt, fn) => { listeners[evt] = fn; },
      removeEventListener: (evt, fn) => { delete listeners[evt]; }
    };

    const tracker = createBehaviorTracker(mockWin);

    // Simulate 3 non-collinear pointer movements (curved human motion)
    assert.ok(listeners.mousemove);
    listeners.mousemove({ clientX: 10, clientY: 10 });
    listeners.mousemove({ clientX: 30, clientY: 80 });
    listeners.mousemove({ clientX: 100, clientY: 120 });

    const telemetry = tracker.getTelemetry();
    assert.equal(telemetry.active, true);
    assert.equal(telemetry.hasInteracted, true);
    assert.equal(telemetry.moves, 3);
    assert.equal(telemetry.curvedTransitions, 1);
    assert.equal(telemetry.linearTransitions, 0);
    assert.equal(telemetry.curvatureRatio, 1.0);

    tracker.stop();
  });

  test('detects synthetic straight-line motion (linear transitions)', () => {
    const listeners = {};
    const mockWin = {
      document: {},
      addEventListener: (evt, fn) => { listeners[evt] = fn; },
      removeEventListener: (evt, fn) => { delete listeners[evt]; }
    };

    const tracker = createBehaviorTracker(mockWin);

    // Simulate perfectly straight linear moves: (0,0) -> (10,10) -> (20,20)
    listeners.mousemove({ clientX: 0, clientY: 0 });
    listeners.mousemove({ clientX: 10, clientY: 10 });
    listeners.mousemove({ clientX: 20, clientY: 20 });

    const telemetry = tracker.getTelemetry();
    assert.equal(telemetry.moves, 3);
    assert.equal(telemetry.linearTransitions, 1);
    assert.equal(telemetry.curvedTransitions, 0);
    assert.equal(telemetry.curvatureRatio, 0.0);

    tracker.stop();
  });

  test('captures keydown intervals and click dwell times', () => {
    const listeners = {};
    const mockWin = {
      document: {},
      addEventListener: (evt, fn) => { listeners[evt] = fn; },
      removeEventListener: (evt, fn) => { delete listeners[evt]; }
    };

    const tracker = createBehaviorTracker(mockWin);

    listeners.mousedown();
    listeners.mouseup();
    listeners.keydown();
    listeners.touchstart();
    listeners.scroll();

    const telemetry = tracker.getTelemetry();
    assert.equal(telemetry.clickCount, 1);
    assert.equal(telemetry.keyCount, 1);
    assert.equal(telemetry.touchCount, 1);
    assert.equal(telemetry.scrollCount, 1);

    tracker.stop();
  });
});
