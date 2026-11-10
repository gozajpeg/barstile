/**
 * Barstile Client Environment & Anti-Automation Probe
 * Gathers deterministic browser runtime integrity signals and automation flags
 * without harvesting PII or relying on external dependencies.
 */

/**
 * Checks whether a given function is a native, un-tampered function.
 * Evasive headless tools often overwrite properties with custom JavaScript functions.
 *
 * @param {Function} fn - Function to test
 * @returns {boolean} True if function appears to be native
 */
export function isNativeFunction(fn) {
  if (typeof fn !== 'function') return false;
  try {
    const fnStr = Function.prototype.toString.call(fn);
    return /^function\s*[\w$]*\s*\(\)\s*\{\s*\[native code\]\s*\}$/.test(fnStr);
  } catch {
    return false;
  }
}

/**
 * Detects presence of automation frameworks (Puppeteer, Playwright, Selenium, WebDriver, etc.).
 *
 * @param {Window} [win] - Window object (defaults to global window if available)
 * @returns {{ isAutomated: boolean, markers: string[] }}
 */
export function detectAutomation(win) {
  const targetWin = win || (typeof window !== 'undefined' ? window : null);
  if (!targetWin) {
    return { isAutomated: false, markers: [] };
  }

  const markers = [];
  const nav = targetWin.navigator;

  // 1. Direct or property-defined navigator.webdriver
  if (nav) {
    if (nav.webdriver === true) {
      markers.push('webdriver_active');
    }

    // Check if webdriver property is defined directly on instance instead of Navigator.prototype
    try {
      if (targetWin.Navigator && targetWin.Navigator.prototype) {
        const ownDesc = Object.getOwnPropertyDescriptor(nav, 'webdriver');
        if (ownDesc && (ownDesc.value === false || ownDesc.get)) {
          // Evasive scraper explicitly set navigator.webdriver on the instance
          markers.push('webdriver_tampered_false');
        }
      }
    } catch {
      // Ignore accessor errors
    }
  }

  // 2. Automation global runtime variables
  const knownGlobals = [
    { key: '_phantom', name: 'phantomjs' },
    { key: '__nightmare', name: 'nightmare' },
    { key: 'callPhantom', name: 'phantomjs_call' },
    { key: '_selenium', name: 'selenium' },
    { key: '__webdriver_script_fn', name: 'webdriver_script' },
    { key: 'domAutomation', name: 'chromium_dom_automation' },
    { key: 'domAutomationController', name: 'chromium_dom_controller' },
    { key: '__puppeteer_eval_', name: 'puppeteer_eval' },
    { key: '__playwright_eval_', name: 'playwright_eval' }
  ];

  for (const { key, name } of knownGlobals) {
    if (key in targetWin) {
      markers.push(`global_${name}`);
    }
  }

  // 3. ChromeDriver CDC variable detection (e.g. cdc_adoQpoasnfa76pfcZLmcfl_Array)
  try {
    const cdcRegex = /^cdc_[a-z0-9]+_/i;
    for (const key of Object.getOwnPropertyNames(targetWin)) {
      if (cdcRegex.test(key)) {
        markers.push('chromedriver_cdc_window');
        break;
      }
    }
    if (targetWin.document) {
      for (const key of Object.getOwnPropertyNames(targetWin.document)) {
        if (cdcRegex.test(key)) {
          markers.push('chromedriver_cdc_document');
          break;
        }
      }
    }
  } catch {
    // Restricted property access
  }

  // 4. Selenium document markers
  try {
    if (targetWin.document && targetWin.document.documentElement) {
      const attrs = targetWin.document.documentElement.attributes;
      if (attrs && (attrs.getNamedItem('webdriver') || attrs.getNamedItem('selenium'))) {
        markers.push('dom_webdriver_attribute');
      }
    }
  } catch {
    // Ignore DOM access issues
  }

  return {
    isAutomated: markers.length > 0,
    markers
  };
}

/**
 * Detects anomalies in browser display dimensions and environment collections
 * commonly present in headless execution.
 *
 * @param {Window} [win]
 * @returns {string[]} List of detected environment anomaly identifiers
 */
export function detectEnvironmentAnomalies(win) {
  const targetWin = win || (typeof window !== 'undefined' ? window : null);
  if (!targetWin) return [];

  const anomalies = [];
  const nav = targetWin.navigator;
  const screen = targetWin.screen;

  // 1. Zero dimension check (headless default before viewport setup)
  if (targetWin.outerWidth === 0 && targetWin.outerHeight === 0) {
    anomalies.push('zero_outer_dimensions');
  }

  // 2. Screen dimension contradictions
  if (screen) {
    if (screen.width === 0 || screen.height === 0) {
      anomalies.push('zero_screen_dimensions');
    }
    if (screen.availWidth > screen.width || screen.availHeight > screen.height) {
      anomalies.push('avail_dimension_overflow');
    }
    if (screen.colorDepth === 0) {
      anomalies.push('zero_color_depth');
    }
  }

  // 3. Languages check
  if (nav) {
    if (!nav.languages || (Array.isArray(nav.languages) && nav.languages.length === 0)) {
      anomalies.push('empty_languages');
    }
    // Headless Chrome missing plugins array or empty when not spoofed
    if (nav.plugins && nav.plugins.length === 0) {
      anomalies.push('zero_plugins');
    }
  }

  return anomalies;
}

/**
 * Inspects WebGL context for software-rasterized renderers (e.g. SwiftShader, llvmpipe)
 * frequently deployed in automated headless scraping clusters on cloud servers.
 *
 * @param {Window} [win]
 * @returns {{ renderer: string, vendor: string, isSoftwareRasterizer: boolean }}
 */
export function detectHardwareRenderer(win) {
  const targetWin = win || (typeof window !== 'undefined' ? window : null);
  if (!targetWin || !targetWin.document) {
    return { renderer: 'unknown', vendor: 'unknown', isSoftwareRasterizer: false };
  }

  try {
    const canvas = targetWin.document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    if (!gl) {
      return { renderer: 'none', vendor: 'none', isSoftwareRasterizer: false };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) {
      return { renderer: 'hidden', vendor: 'hidden', isSoftwareRasterizer: false };
    }

    const vendor = String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '');
    const renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '');

    const isSoftware = /SwiftShader|llvmpipe|softpipe|software\s*rasterizer|Mesa/i.test(renderer);

    return {
      renderer: renderer.slice(0, 64),
      vendor: vendor.slice(0, 64),
      isSoftwareRasterizer: isSoftware
    };
  } catch {
    return { renderer: 'error', vendor: 'error', isSoftwareRasterizer: false };
  }
}

/**
 * Inspects native prototype methods to verify they haven't been monkey-patched.
 *
 * @param {Window} [win]
 * @returns {string[]} List of tampered prototype names
 */
export function detectPrototypeTampering(win) {
  const targetWin = win || (typeof window !== 'undefined' ? window : null);
  if (!targetWin) return [];

  const tampered = [];

  // Check Function.prototype.toString
  const winFunction = targetWin.Function || (typeof Function !== 'undefined' ? Function : null);
  if (winFunction?.prototype && !isNativeFunction(winFunction.prototype.toString)) {
    tampered.push('Function.prototype.toString');
  }

  // Check Navigator.prototype.webdriver descriptor if Navigator exists
  if (targetWin.Navigator && targetWin.Navigator.prototype) {
    try {
      const desc = Object.getOwnPropertyDescriptor(targetWin.Navigator.prototype, 'webdriver');
      if (desc && desc.get && !isNativeFunction(desc.get)) {
        tampered.push('Navigator.prototype.webdriver:getter');
      }
    } catch {
      // Ignore descriptor access errors
    }
  }

  return tampered;
}

/**
 * Runs complete browser integrity probe and produces structured telemetry.
 * Safe to call in any context (Browser, Web Worker, Node.js).
 *
 * @param {Window} [win]
 * @returns {Object} Structured integrity telemetry
 */
export function collectBrowserProbe(win) {
  const startTime = Date.now();
  const targetWin = win || (typeof window !== 'undefined' ? window : null);

  if (!targetWin) {
    return {
      isBrowser: false,
      isWorker: typeof importScripts === 'function',
      timestamp: startTime,
      evalDurationMs: 0,
      automation: { isAutomated: false, markers: [] },
      anomalies: [],
      renderer: { renderer: 'none', vendor: 'none', isSoftwareRasterizer: false },
      tampered: []
    };
  }

  const automation = detectAutomation(targetWin);
  const anomalies = detectEnvironmentAnomalies(targetWin);
  const renderer = detectHardwareRenderer(targetWin);
  const tampered = detectPrototypeTampering(targetWin);

  const evalDurationMs = Date.now() - startTime;

  return {
    isBrowser: true,
    isWorker: false,
    timestamp: startTime,
    evalDurationMs,
    automation,
    anomalies,
    renderer,
    tampered,
    hardware: {
      concurrency: Number(targetWin.navigator?.hardwareConcurrency) || 0,
      deviceMemory: Number(targetWin.navigator?.deviceMemory) || 0,
      platform: String(targetWin.navigator?.platform || '').slice(0, 32),
      languagesCount: Array.isArray(targetWin.navigator?.languages)
        ? targetWin.navigator.languages.length
        : 0
    }
  };
}

/**
 * Encodes probe telemetry into a compact, URL-safe base64 string bound to the challenge salt.
 *
 * @param {Object} probe - Output from collectBrowserProbe()
 * @param {string} [salt=''] - Challenge salt for ephemeral binding
 * @returns {string} Compact base64 encoded telemetry envelope
 */
export function encodeProbeTelemetry(probe, salt = '') {
  const envelope = {
    t: probe.timestamp || Date.now(),
    s: String(salt || '').slice(0, 16),
    dur: probe.evalDurationMs || 0,
    bot: probe.automation?.isAutomated ? 1 : 0,
    m: probe.automation?.markers || [],
    anom: probe.anomalies || [],
    soft: probe.renderer?.isSoftwareRasterizer ? 1 : 0,
    tamp: probe.tampered || [],
    hw: [
      probe.hardware?.concurrency || 0,
      probe.hardware?.deviceMemory || 0,
      probe.hardware?.languagesCount || 0
    ]
  };

  const jsonStr = JSON.stringify(envelope);
  if (typeof btoa === 'function') {
    return btoa(jsonStr);
  } else if (typeof Buffer !== 'undefined') {
    return Buffer.from(jsonStr, 'utf-8').toString('base64');
  }
  return jsonStr;
}

/**
 * Decodes and unpacks telemetry envelope on server or verifier.
 *
 * @param {string} rawBase64
 * @returns {Object|null} Unpacked telemetry envelope or null if invalid
 */
export function decodeProbeTelemetry(rawBase64) {
  if (typeof rawBase64 !== 'string' || !rawBase64.trim()) return null;

  try {
    let jsonStr = '';
    if (typeof Buffer !== 'undefined') {
      jsonStr = Buffer.from(rawBase64, 'base64').toString('utf-8');
    } else if (typeof atob === 'function') {
      jsonStr = atob(rawBase64);
    } else {
      jsonStr = rawBase64;
    }

    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object') return null;

    return {
      timestamp: Number(data.t) || 0,
      salt: String(data.s || ''),
      evalDurationMs: Number(data.dur) || 0,
      isAutomated: Boolean(data.bot),
      markers: Array.isArray(data.m) ? data.m : [],
      anomalies: Array.isArray(data.anom) ? data.anom : [],
      isSoftwareRasterizer: Boolean(data.soft),
      tampered: Array.isArray(data.tamp) ? data.tamp : [],
      hardware: {
        concurrency: data.hw?.[0] || 0,
        deviceMemory: data.hw?.[1] || 0,
        languagesCount: data.hw?.[2] || 0
      }
    };
  } catch {
    return null;
  }
}
