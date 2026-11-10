import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isNativeFunction,
  detectAutomation,
  detectEnvironmentAnomalies,
  detectHardwareRenderer,
  detectPrototypeTampering,
  collectBrowserProbe,
  encodeProbeTelemetry,
  decodeProbeTelemetry
} from '../src/client/probe.js';

describe('Anti-Automation & Environment Integrity Probe', () => {
  describe('isNativeFunction', () => {
    test('detects built-in native functions', () => {
      assert.equal(isNativeFunction(Math.max), true);
      assert.equal(isNativeFunction(Date.now), true);
      assert.equal(isNativeFunction(Array.prototype.push), true);
    });

    test('detects userland JavaScript functions', () => {
      const customFn = () => 42;
      function normalFn() { return 'hello'; }
      assert.equal(isNativeFunction(customFn), false);
      assert.equal(isNativeFunction(normalFn), false);
    });

    test('safely handles non-function inputs', () => {
      assert.equal(isNativeFunction(null), false);
      assert.equal(isNativeFunction(undefined), false);
      assert.equal(isNativeFunction({}), false);
    });
  });

  describe('detectAutomation', () => {
    test('reports clean on regular simulated browser window', () => {
      function Navigator() {}
      Navigator.prototype = { webdriver: false };
      const mockWin = {
        Navigator,
        navigator: Object.create(Navigator.prototype),
        document: { documentElement: { attributes: { getNamedItem: () => null } } }
      };
      const result = detectAutomation(mockWin);
      assert.equal(result.isAutomated, false);
      assert.equal(result.markers.length, 0);
    });

    test('detects active navigator.webdriver flag', () => {
      const mockWin = {
        navigator: { webdriver: true }
      };
      const result = detectAutomation(mockWin);
      assert.equal(result.isAutomated, true);
      assert.ok(result.markers.includes('webdriver_active'));
    });

    test('detects evasive scraper explicitly overriding navigator.webdriver on instance', () => {
      function Navigator() {}
      Navigator.prototype = { webdriver: false };
      const mockNav = Object.create(Navigator.prototype);
      Object.defineProperty(mockNav, 'webdriver', {
        value: false,
        configurable: true,
        enumerable: true
      });
      const mockWin = { Navigator, navigator: mockNav };
      const result = detectAutomation(mockWin);
      assert.equal(result.isAutomated, true);
      assert.ok(result.markers.includes('webdriver_tampered_false'));
    });

    test('detects global automation variables', () => {
      const mockWin = {
        navigator: { webdriver: false },
        __puppeteer_eval_: true
      };
      const result = detectAutomation(mockWin);
      assert.equal(result.isAutomated, true);
      assert.ok(result.markers.includes('global_puppeteer_eval'));
    });

    test('detects ChromeDriver CDC window markers', () => {
      const mockWin = {
        navigator: { webdriver: false },
        cdc_adoQpoasnfa76pfcZLmcfl_Array: true
      };
      const result = detectAutomation(mockWin);
      assert.equal(result.isAutomated, true);
      assert.ok(result.markers.includes('chromedriver_cdc_window'));
    });
  });

  describe('detectEnvironmentAnomalies', () => {
    test('flags zero outer dimensions', () => {
      const mockWin = {
        outerWidth: 0,
        outerHeight: 0,
        navigator: { languages: ['en-US'], plugins: [1] },
        screen: { width: 1920, height: 1080, availWidth: 1920, availHeight: 1040, colorDepth: 24 }
      };
      const anomalies = detectEnvironmentAnomalies(mockWin);
      assert.ok(anomalies.includes('zero_outer_dimensions'));
    });

    test('flags screen dimension contradictions', () => {
      const mockWin = {
        outerWidth: 800,
        outerHeight: 600,
        navigator: { languages: ['en-US'], plugins: [1] },
        screen: { width: 800, height: 600, availWidth: 1200, availHeight: 600, colorDepth: 24 }
      };
      const anomalies = detectEnvironmentAnomalies(mockWin);
      assert.ok(anomalies.includes('avail_dimension_overflow'));
    });
  });

  describe('detectHardwareRenderer', () => {
    test('identifies cloud software rasterizers (SwiftShader)', () => {
      const mockGl = {
        getExtension: (name) => name === 'WEBGL_debug_renderer_info' ? {} : null,
        getParameter: (param) => 'Google SwiftShader (LLVM 10.0.0)'
      };
      const mockWin = {
        document: {
          createElement: () => ({ getContext: () => mockGl })
        }
      };
      const result = detectHardwareRenderer(mockWin);
      assert.equal(result.isSoftwareRasterizer, true);
      assert.ok(result.renderer.includes('SwiftShader'));
    });

    test('identifies genuine hardware GPU', () => {
      const mockGl = {
        getExtension: (name) => name === 'WEBGL_debug_renderer_info' ? {} : null,
        getParameter: (param) => 'NVIDIA GeForce RTX 4070'
      };
      const mockWin = {
        document: {
          createElement: () => ({ getContext: () => mockGl })
        }
      };
      const result = detectHardwareRenderer(mockWin);
      assert.equal(result.isSoftwareRasterizer, false);
      assert.ok(result.renderer.includes('NVIDIA'));
    });
  });

  describe('Telemetry Encoding & Decoding Envelope', () => {
    test('encodes and decodes probe telemetry reversibly with salt binding', () => {
      const probe = {
        timestamp: 1774000000000,
        evalDurationMs: 4,
        automation: { isAutomated: true, markers: ['webdriver_active'] },
        anomalies: ['zero_outer_dimensions'],
        renderer: { isSoftwareRasterizer: true, renderer: 'SwiftShader' },
        tampered: [],
        hardware: { concurrency: 8, deviceMemory: 16, languagesCount: 2 }
      };

      const salt = 'a1b2c3d4e5f6';
      const encoded = encodeProbeTelemetry(probe, salt);
      assert.equal(typeof encoded, 'string');
      assert.ok(encoded.length > 20);

      const decoded = decodeProbeTelemetry(encoded);
      assert.ok(decoded);
      assert.equal(decoded.timestamp, 1774000000000);
      assert.equal(decoded.salt, salt);
      assert.equal(decoded.isAutomated, true);
      assert.deepEqual(decoded.markers, ['webdriver_active']);
      assert.deepEqual(decoded.anomalies, ['zero_outer_dimensions']);
      assert.equal(decoded.isSoftwareRasterizer, true);
      assert.equal(decoded.hardware.concurrency, 8);
    });

    test('returns null gracefully on corrupt payload', () => {
      assert.equal(decodeProbeTelemetry(''), null);
      assert.equal(decodeProbeTelemetry('!@#$%not_base64'), null);
    });
  });
});
