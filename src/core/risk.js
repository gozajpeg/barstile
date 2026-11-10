/**
 * Barstile Multi-Factor Risk Scoring Engine
 * Combines browser environment integrity, behavioral dynamics, and HTTP header heuristics
 * into a normalized risk score [0.0, 1.0] to govern dynamic challenge escalation.
 */

/**
 * Evaluates HTTP request headers for browser emulation inconsistencies.
 *
 * @param {Object} headers - Normalized request headers (lowercase keys)
 * @returns {{ penalty: number, reasons: string[] }}
 */
export function evaluateHeaderHeuristics(headers = {}) {
  const reasons = [];
  let penalty = 0;

  const ua = String(headers['user-agent'] || '').toLowerCase();
  const secChUa = String(headers['sec-ch-ua'] || '').toLowerCase();
  const secChPlatform = String(headers['sec-ch-ua-platform'] || '').toLowerCase();
  const acceptLanguage = headers['accept-language'];

  // 1. Missing or blank User-Agent
  if (!ua.trim()) {
    penalty += 0.6;
    reasons.push('missing_user_agent');
  }

  // 2. Direct bot/scraper signatures in User-Agent
  const botUaRegex = /curl|wget|python-requests|aiohttp|scrapy|axios|got\/|postmanruntime|httpie/i;
  if (botUaRegex.test(ua)) {
    penalty += 0.8;
    reasons.push('script_user_agent');
  }

  // 3. Sec-CH-UA Platform contradiction with User-Agent
  if (secChPlatform && ua) {
    if (secChPlatform.includes('windows') && (ua.includes('macintosh') || ua.includes('iphone'))) {
      penalty += 0.5;
      reasons.push('os_platform_mismatch');
    } else if (secChPlatform.includes('mac') && ua.includes('windows')) {
      penalty += 0.5;
      reasons.push('os_platform_mismatch');
    }
  }

  // 4. Sec-CH-UA browser contradictions
  if (secChUa && ua) {
    if (secChUa.includes('chrome') && ua.includes('firefox')) {
      penalty += 0.5;
      reasons.push('browser_family_mismatch');
    }
  }

  // 5. Standard browser request missing Accept-Language
  if (ua.includes('mozilla') && !acceptLanguage) {
    penalty += 0.2;
    reasons.push('missing_accept_language');
  }

  return { penalty: Math.min(penalty, 1.0), reasons };
}

/**
 * Evaluates decoded browser environment probe telemetry.
 *
 * @param {Object|null} probe - Decoded probe telemetry from client
 * @returns {{ penalty: number, reasons: string[] }}
 */
export function evaluateProbeTelemetry(probe) {
  if (!probe) {
    // Missing probe when client claims to be a full browser
    return { penalty: 0.45, reasons: ['missing_telemetry_probe'] };
  }

  const reasons = [];
  let penalty = 0;

  // 1. Hard automation detection (Puppeteer, Playwright, Selenium, WebDriver)
  if (probe.isAutomated) {
    penalty += 0.85;
    reasons.push(`automation_detected:${(probe.markers || []).join(',')}`);
  }

  // 2. Prototype tampering (hooked native getters)
  if (Array.isArray(probe.tampered) && probe.tampered.length > 0) {
    penalty += 0.75;
    reasons.push(`tampered_prototypes:${probe.tampered.join(',')}`);
  }

  // 3. Environmental anomalies (zero dimensions, screen contradictions)
  if (Array.isArray(probe.anomalies) && probe.anomalies.length > 0) {
    if (probe.anomalies.includes('zero_outer_dimensions')) {
      penalty += 0.6;
      reasons.push('headless_zero_dimensions');
    } else {
      penalty += 0.3;
      reasons.push(`anomalies:${probe.anomalies.join(',')}`);
    }
  }

  // 4. Cloud server software rasterizer (SwiftShader / llvmpipe)
  if (probe.isSoftwareRasterizer) {
    penalty += 0.35;
    reasons.push('software_rasterizer_detected');
  }

  return { penalty: Math.min(penalty, 1.0), reasons };
}

/**
 * Evaluates behavioral telemetry metrics.
 *
 * @param {Object|null} behavior - Behavioral telemetry from client
 * @returns {{ penalty: number, discount: number, reasons: string[] }}
 */
export function evaluateBehaviorTelemetry(behavior) {
  if (!behavior || !behavior.active) {
    return { penalty: 0, discount: 0, reasons: [] };
  }

  const reasons = [];
  let penalty = 0;
  let discount = 0;

  // Natural human indicators (curved mouse transitions, natural dwell)
  if (behavior.hasInteracted) {
    if (behavior.moves >= 5 && behavior.curvatureRatio >= 0.3) {
      discount += 0.35;
      reasons.push('organic_pointer_curvature');
    }

    if (behavior.clickCount > 0 && behavior.avgClickDwellMs >= 40 && behavior.avgClickDwellMs <= 400) {
      discount += 0.2;
      reasons.push('natural_click_dwell');
    }

    if (behavior.touchCount > 0) {
      discount += 0.3;
      reasons.push('genuine_touch_events');
    }

    // Bot linearity indicator: >15 moves with 0 curvature (pure straight teleportation)
    if (behavior.moves > 15 && behavior.curvatureRatio < 0.05) {
      penalty += 0.45;
      reasons.push('synthetic_linear_trajectory');
    }
  }

  return { penalty, discount, reasons };
}

/**
 * Calculates a consolidated risk score and recommended action ladder.
 *
 * @param {Object} params
 * @param {Object} [params.headers={}] - HTTP request headers
 * @param {Object|null} [params.probe=null] - Decoded browser probe telemetry
 * @param {Object|null} [params.behavior=null] - Decoded behavioral telemetry
 * @param {number} [params.baselineRisk=0.1] - Base environment risk [0, 1]
 * @returns {{
 *   score: number,
 *   action: 'pass' | 'challenge' | 'block',
 *   recommendedDifficulty: number,
 *   factors: string[]
 * }}
 */
export function calculateRiskScore({
  headers = {},
  probe = null,
  behavior = null,
  baselineRisk = 0.1
} = {}) {
  let score = baselineRisk;
  const factors = [];

  // Evaluate header heuristics
  const headerResult = evaluateHeaderHeuristics(headers);
  score += headerResult.penalty;
  factors.push(...headerResult.reasons);

  // Evaluate probe telemetry
  const probeResult = evaluateProbeTelemetry(probe);
  score += probeResult.penalty;
  factors.push(...probeResult.reasons);

  // Evaluate behavior telemetry
  const behaviorResult = evaluateBehaviorTelemetry(behavior);
  score += behaviorResult.penalty;
  score -= behaviorResult.discount;
  factors.push(...behaviorResult.reasons);

  // Clamp score strictly to [0.0, 1.0]
  score = Math.max(0.0, Math.min(1.0, Number(score.toFixed(3))));

  // Determine action and dynamic PoW difficulty ladder
  let action = 'pass';
  let recommendedDifficulty = 0;

  if (score < 0.25) {
    // Trusted human user: Instant silent clearance with zero computational friction
    action = 'pass';
    recommendedDifficulty = 0;
  } else if (score < 0.5) {
    // Low ambiguity (e.g. fresh visitor, privacy browser): Minimal friction (2-3 leading zeros)
    action = 'challenge';
    recommendedDifficulty = 3;
  } else if (score < 0.75) {
    // Moderate ambiguity (e.g. data center IP, suspicious headers): Standard friction (4 leading zeros)
    action = 'challenge';
    recommendedDifficulty = 4;
  } else {
    // High-confidence bot/headless automation: Computational tarpit or hard block
    action = 'block';
    recommendedDifficulty = 6;
  }

  return {
    score,
    action,
    recommendedDifficulty,
    factors
  };
}
