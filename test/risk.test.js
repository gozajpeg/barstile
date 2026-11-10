import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRiskScore,
  evaluateHeaderHeuristics,
  evaluateProbeTelemetry,
  evaluateBehaviorTelemetry
} from '../src/core/risk.js';

describe('Multi-Factor Risk Scoring Engine', () => {
  describe('evaluateHeaderHeuristics', () => {
    test('penalizes missing or blank User-Agent', () => {
      const result = evaluateHeaderHeuristics({});
      assert.ok(result.penalty >= 0.5);
      assert.ok(result.reasons.includes('missing_user_agent'));
    });

    test('penalizes scraper / bot User-Agent strings', () => {
      const result = evaluateHeaderHeuristics({ 'user-agent': 'python-requests/2.31.0' });
      assert.ok(result.penalty >= 0.8);
      assert.ok(result.reasons.includes('script_user_agent'));
    });

    test('penalizes platform mismatch contradictions', () => {
      const result = evaluateHeaderHeuristics({
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'sec-ch-ua-platform': '"Windows"'
      });
      assert.ok(result.penalty >= 0.5);
      assert.ok(result.reasons.includes('os_platform_mismatch'));
    });

    test('accepts consistent browser headers with 0 penalty', () => {
      const result = evaluateHeaderHeuristics({
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24"',
        'sec-ch-ua-platform': '"Windows"',
        'accept-language': 'en-US,en;q=0.9'
      });
      assert.equal(result.penalty, 0);
      assert.equal(result.reasons.length, 0);
    });
  });

  describe('evaluateProbeTelemetry', () => {
    test('assigns high penalty for detected automation', () => {
      const probe = {
        isAutomated: true,
        markers: ['webdriver_active', 'chromedriver_cdc_window'],
        anomalies: [],
        isSoftwareRasterizer: false
      };
      const result = evaluateProbeTelemetry(probe);
      assert.ok(result.penalty >= 0.8);
    });

    test('penalizes software rasterizer in cloud headless scraping', () => {
      const probe = {
        isAutomated: false,
        markers: [],
        anomalies: [],
        isSoftwareRasterizer: true
      };
      const result = evaluateProbeTelemetry(probe);
      assert.ok(result.penalty >= 0.35);
      assert.ok(result.reasons.includes('software_rasterizer_detected'));
    });
  });

  describe('evaluateBehaviorTelemetry', () => {
    test('provides discount for organic pointer curvature and natural dwell', () => {
      const behavior = {
        active: true,
        hasInteracted: true,
        moves: 20,
        curvatureRatio: 0.65,
        clickCount: 1,
        avgClickDwellMs: 110,
        touchCount: 0
      };
      const result = evaluateBehaviorTelemetry(behavior);
      assert.ok(result.discount >= 0.5);
      assert.equal(result.penalty, 0);
    });

    test('penalizes synthetic straight-line mouse movement (>15 moves with 0 curvature)', () => {
      const behavior = {
        active: true,
        hasInteracted: true,
        moves: 25,
        curvatureRatio: 0.0,
        clickCount: 0,
        avgClickDwellMs: 0,
        touchCount: 0
      };
      const result = evaluateBehaviorTelemetry(behavior);
      assert.ok(result.penalty >= 0.4);
      assert.ok(result.reasons.includes('synthetic_linear_trajectory'));
    });
  });

  describe('calculateRiskScore consolidated ladder', () => {
    test('classifies trusted human as silent "pass" (0 PoW difficulty)', () => {
      const headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
        'sec-ch-ua-platform': '"Windows"',
        'accept-language': 'en-US'
      };
      const probe = {
        isAutomated: false,
        markers: [],
        anomalies: [],
        isSoftwareRasterizer: false,
        tampered: []
      };
      const behavior = {
        active: true,
        hasInteracted: true,
        moves: 12,
        curvatureRatio: 0.7,
        clickCount: 1,
        avgClickDwellMs: 95
      };

      const result = calculateRiskScore({ headers, probe, behavior, baselineRisk: 0.05 });
      assert.equal(result.action, 'pass');
      assert.equal(result.recommendedDifficulty, 0);
      assert.ok(result.score < 0.25);
    });

    test('classifies headless automated bot as "block" tier (high difficulty)', () => {
      const headers = {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/122.0.0.0'
      };
      const probe = {
        isAutomated: true,
        markers: ['webdriver_active', 'chromedriver_cdc_window'],
        anomalies: ['zero_outer_dimensions'],
        isSoftwareRasterizer: true,
        tampered: []
      };

      const result = calculateRiskScore({ headers, probe, baselineRisk: 0.1 });
      assert.equal(result.action, 'block');
      assert.ok(result.score >= 0.75);
      assert.ok(result.recommendedDifficulty >= 6);
    });
  });
});
