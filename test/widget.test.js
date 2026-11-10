import { test, describe, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { barstileMiddleware } from '../src/server/middleware.js';
import { createBarstile } from '../src/server/barstile.js';
import { getClientFingerprint } from '../src/core/fingerprint.js';
import { renderWidget, autoInitializeWidgets } from '../src/client/widget.js';
import { encodeProbeTelemetry } from '../src/client/probe.js';
import { solveWorker } from '../src/client/worker.js';

function createMockDOM() {
  const elementsById = new Map();
  const allCreatedElements = [];

  function createElement(tagName) {
    const listeners = {};
    const attributes = {};
    const children = [];

    const el = {
      tagName: tagName.toUpperCase(),
      _id: '',
      get id() {
        return this._id;
      },
      set id(val) {
        this._id = val;
        elementsById.set(val, this);
      },
      className: '',
      type: '',
      name: '',
      value: '',
      tabIndex: -1,
      style: {},
      parentNode: null,
      _textContent: '',
      _innerHTML: '',
      get textContent() {
        return this._textContent;
      },
      set textContent(val) {
        this._textContent = String(val);
      },
      get innerHTML() {
        return this._innerHTML;
      },
      set innerHTML(val) {
        this._innerHTML = String(val);
        if (val === '') {
          children.length = 0;
        }
      },
      children,
      setAttribute(k, v) {
        attributes[k] = String(v);
        if (k === 'id') {
          this.id = v;
        }
      },
      getAttribute(k) {
        return attributes[k] !== undefined ? attributes[k] : null;
      },
      appendChild(child) {
        child.parentNode = this;
        children.push(child);
        return child;
      },
      querySelector(selector) {
        if (selector === 'input[name="barstile-token"]') {
          return children.find(c => c.tagName === 'INPUT' && c.name === 'barstile-token') || null;
        }
        return null;
      },
      closest(selector) {
        let curr = this.parentNode;
        while (curr) {
          if (selector === 'form' && curr.tagName === 'FORM') {
            return curr;
          }
          curr = curr.parentNode;
        }
        return null;
      },
      addEventListener(evt, fn) {
        listeners[evt] = listeners[evt] || [];
        listeners[evt].push(fn);
      },
      removeEventListener(evt, fn) {
        if (listeners[evt]) {
          listeners[evt] = listeners[evt].filter(f => f !== fn);
        }
      },
      dispatchEvent(evt) {
        const fns = listeners[evt.type] || [];
        for (const fn of fns) {
          fn(evt);
        }
      },
      click() {
        this.dispatchEvent({ type: 'click' });
      },
      submit() {
        if (this._onSubmitNative) {
          this._onSubmitNative();
        }
      }
    };
    allCreatedElements.push(el);
    return el;
  }

  const head = createElement('head');
  const body = createElement('body');

  const doc = {
    head,
    body,
    createElement(tag) {
      return createElement(tag);
    },
    getElementById(id) {
      return elementsById.get(id) || null;
    },
    querySelector(selector) {
      if (selector === 'head') return head;
      if (selector === 'body') return body;
      if (selector.startsWith('#')) {
        return elementsById.get(selector.slice(1)) || null;
      }
      return null;
    },
    querySelectorAll(selector) {
      if (selector.includes('.barstile-widget') || selector.includes('[data-barstile]')) {
        return allCreatedElements.filter(el =>
          (el.className && el.className.includes('barstile-widget')) ||
          el.getAttribute('data-barstile') !== null
        );
      }
      return [];
    }
  };

  const win = {
    Function: globalThis.Function,
    document: doc,
    navigator: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      webdriver: false,
      languages: ['en-US'],
      plugins: [1]
    },
    outerWidth: 1920,
    outerHeight: 1080,
    screen: { width: 1920, height: 1080, availWidth: 1920, availHeight: 1040, colorDepth: 24 },
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  return { doc, win, createElement };
}

describe('Drop-in Client Widget and Verification Flow', () => {
  let server;
  let serverUrl;
  let engine;
  let origDoc;
  let origWin;
  let mockDOM;

  before(async () => {
    engine = createBarstile({ difficulty: 1 });
    const middleware = barstileMiddleware({
      difficulty: 1,
      blockBots: true,
      engine
    });

    server = http.createServer((req, res) => {
      if (req.url === '/custom-challenge-449') {
        const fingerprint = getClientFingerprint(req);
        const challenge = engine.issueChallenge({ difficulty: 1, context: fingerprint });
        res.statusCode = 449;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Barstile-Challenge', challenge);
        return res.end(JSON.stringify({ challenge, header: 'x-barstile-challenge' }));
      }

      if (req.url === '/error-challenge-500') {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'server_down' }));
      }

      middleware(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok', barstile: req.barstile }));
      });
    });

    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        serverUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(() => {
    origDoc = globalThis.document;
    origWin = globalThis.window;
    mockDOM = createMockDOM();
    globalThis.document = mockDOM.doc;
    globalThis.window = mockDOM.win;
  });

  afterEach(() => {
    globalThis.document = origDoc;
    globalThis.window = origWin;
  });

  test('renderWidget creates DOM structure, accessibility attributes, and injects styles', () => {
    const container = mockDOM.createElement('div');
    const widget = renderWidget(container, {
      challengeUrl: `${serverUrl}/api/barstile/challenge`,
      verifyUrl: `${serverUrl}/api/barstile/verify`
    });

    assert.equal(widget.getStatus(), 'idle');
    assert.equal(widget.getToken(), null);

    const styleEl = mockDOM.doc.getElementById('barstile-widget-styles');
    assert.ok(styleEl, 'Widget styles must be injected into document head');

    const hiddenInput = container.querySelector('input[name="barstile-token"]');
    assert.ok(hiddenInput, 'Hidden input barstile-token must be created');
    assert.equal(hiddenInput.type, 'hidden');

    const root = container.children.find(c => c.className === 'barstile-container');
    assert.ok(root, 'Root container must have class barstile-container');

    const checkWrapper = root.children.find(c => c.className === 'barstile-checkbox-wrapper');
    assert.ok(checkWrapper, 'Checkbox wrapper must exist');

    const boxEl = checkWrapper.children.find(c => c.getAttribute('role') === 'checkbox');
    assert.ok(boxEl, 'Checkbox element must have role="checkbox"');
    assert.equal(boxEl.getAttribute('aria-checked'), 'false');
    assert.equal(boxEl.tabIndex, 0);

    const labelEl = checkWrapper.children.find(c => c.className === 'barstile-label');
    assert.ok(labelEl, 'Label element must exist');
    assert.equal(labelEl.textContent, 'Verify you are human');

    widget.destroy();
  });

  test('clean challenge and verify integration against mock HTTP server', async () => {
    const container = mockDOM.createElement('div');
    let successToken = null;

    const widget = renderWidget(container, {
      challengeUrl: `${serverUrl}/api/barstile/challenge`,
      verifyUrl: `${serverUrl}/api/barstile/verify`,
      onSuccess: (tok) => {
        successToken = tok;
      }
    });

    const root = container.children.find(c => c.className === 'barstile-container');
    const checkWrapper = root.children.find(c => c.className === 'barstile-checkbox-wrapper');
    const boxEl = checkWrapper.children.find(c => c.getAttribute('role') === 'checkbox');

    assert.equal(boxEl.getAttribute('aria-checked'), 'false');

    boxEl.click();

    const token = await widget.verify();
    assert.ok(token, 'Verification must return a valid clearance token');
    assert.equal(widget.getStatus(), 'verified');
    assert.equal(widget.getToken(), token);
    assert.equal(successToken, token);
    assert.equal(boxEl.getAttribute('aria-checked'), 'true');

    const hiddenInput = container.querySelector('input[name="barstile-token"]');
    assert.equal(hiddenInput.value, token);

    widget.destroy();
  });

  test('form submission interceptor prevents initial submit and completes verification', async () => {
    const form = mockDOM.createElement('form');
    const container = mockDOM.createElement('div');
    form.appendChild(container);

    let nativeSubmitCalled = false;
    form._onSubmitNative = () => {
      nativeSubmitCalled = true;
    };

    const widget = renderWidget(container, {
      challengeUrl: `${serverUrl}/api/barstile/challenge`,
      verifyUrl: `${serverUrl}/api/barstile/verify`
    });

    let prevented = false;
    const submitEvt = {
      type: 'submit',
      preventDefault: () => {
        prevented = true;
      }
    };

    form.dispatchEvent(submitEvt);
    assert.equal(prevented, true, 'Form submit must be prevented while unverified');

    // Wait until verification finishes and native submit is invoked
    const deadline = Date.now() + 2000;
    while (!nativeSubmitCalled && Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 20));
    }

    assert.equal(nativeSubmitCalled, true, 'Form must be natively submitted once verified');
    assert.equal(widget.getStatus(), 'verified');

    const hiddenInput = container.querySelector('input[name="barstile-token"]');
    assert.ok(hiddenInput.value, 'Hidden input must be populated with token');

    widget.destroy();
  });

  test('bot blocking verification: automated probe receives HTTP 403 automation_detected', async () => {
    const chalRes = await fetch(`${serverUrl}/api/barstile/challenge`);
    assert.equal(chalRes.status, 200);
    const chalData = await chalRes.json();
    assert.ok(chalData.challenge);

    const solveResult = await solveWorker(chalData.challenge);
    const solution = solveResult.solution || solveResult;
    const salt = chalData.challenge.split('.')[0];

    const automatedProbe = {
      automation: {
        isAutomated: true,
        markers: ['webdriver_active']
      },
      anomalies: [],
      hardware: {}
    };
    const telemetry = encodeProbeTelemetry(automatedProbe, salt);

    const verifyRes = await fetch(`${serverUrl}/api/barstile/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Barstile-Solution': solution,
        'X-Barstile-Telemetry': telemetry
      },
      body: JSON.stringify({
        solution,
        telemetry
      })
    });

    assert.equal(verifyRes.status, 403);
    const body = await verifyRes.json();
    assert.equal(body.error, 'barstile_failed');
    assert.equal(body.reason, 'automation_detected');
    assert.deepEqual(body.markers, ['webdriver_active']);
  });

  test('widget challenge retrieval accepts HTTP 449 challenge response without throwing', async () => {
    const container = mockDOM.createElement('div');
    const widget = renderWidget(container, {
      challengeUrl: `${serverUrl}/custom-challenge-449`,
      verifyUrl: `${serverUrl}/api/barstile/verify`
    });

    const token = await widget.verify();
    assert.ok(token, 'Should resolve token when challenge endpoint returns HTTP 449');
    assert.equal(widget.getStatus(), 'verified');

    widget.destroy();
  });

  test('renderWidget throws descriptive error when target container is not found', () => {
    assert.throws(() => renderWidget(null), /Widget target container not found/);
    assert.throws(() => renderWidget('#missing-container-id'), /Widget target container not found/);
  });

  test('concurrent verify() calls deduplicate to the exact same pending Promise', async () => {
    const container = mockDOM.createElement('div');
    const widget = renderWidget(container, {
      challengeUrl: `${serverUrl}/api/barstile/challenge`,
      verifyUrl: `${serverUrl}/api/barstile/verify`
    });

    const p1 = widget.verify();
    const p2 = widget.verify();
    const p3 = widget.verify();

    assert.equal(p1, p2, 'Concurrent verify() call 2 must share same Promise');
    assert.equal(p2, p3, 'Concurrent verify() call 3 must share same Promise');

    const [t1, t2, t3] = await Promise.all([p1, p2, p3]);
    assert.ok(t1);
    assert.equal(t1, t2);
    assert.equal(t2, t3);
    assert.equal(widget.getStatus(), 'verified');

    widget.destroy();
  });

  test('cached token is returned immediately on subsequent verify() without re-solving', async () => {
    const container = mockDOM.createElement('div');
    const widget = renderWidget(container, {
      challengeUrl: `${serverUrl}/api/barstile/challenge`,
      verifyUrl: `${serverUrl}/api/barstile/verify`
    });

    const token1 = await widget.verify();
    assert.ok(token1);

    const token2 = await widget.verify();
    assert.equal(token2, token1, 'Subsequent verify() call must return identical cached token');

    widget.destroy();
  });

  test('keyboard accessibility: Enter and Space trigger verification while other keys are ignored', async () => {
    const container = mockDOM.createElement('div');
    const widget = renderWidget(container, {
      challengeUrl: `${serverUrl}/api/barstile/challenge`,
      verifyUrl: `${serverUrl}/api/barstile/verify`
    });

    const root = container.children.find(c => c.className === 'barstile-container');
    const checkWrapper = root.children.find(c => c.className === 'barstile-checkbox-wrapper');
    const boxEl = checkWrapper.children.find(c => c.getAttribute('role') === 'checkbox');

    // Tab key does not trigger verification
    let tabPrevented = false;
    boxEl.dispatchEvent({ type: 'keydown', key: 'Tab', preventDefault: () => { tabPrevented = true; } });
    assert.equal(tabPrevented, false);
    assert.equal(widget.getStatus(), 'idle');

    // Space key triggers verification
    let spacePrevented = false;
    boxEl.dispatchEvent({ type: 'keydown', key: ' ', preventDefault: () => { spacePrevented = true; } });
    assert.equal(spacePrevented, true);
    assert.equal(widget.getStatus(), 'solving');

    const token = await widget.verify();
    assert.ok(token);
    assert.equal(widget.getStatus(), 'verified');

    widget.destroy();
  });

  test('challenge failure HTTP 500 sets status to error and triggers onError callback', async () => {
    const container = mockDOM.createElement('div');
    let capturedError = null;

    const widget = renderWidget(container, {
      challengeUrl: `${serverUrl}/error-challenge-500`,
      verifyUrl: `${serverUrl}/api/barstile/verify`,
      onError: (err) => {
        capturedError = err;
      }
    });

    await assert.rejects(
      async () => {
        await widget.verify();
      },
      /HTTP 500/
    );

    assert.equal(widget.getStatus(), 'error');
    assert.ok(capturedError, 'onError callback must receive the rejection error');
    assert.match(capturedError.message, /HTTP 500/);

    const root = container.children.find(c => c.className === 'barstile-container');
    const checkWrapper = root.children.find(c => c.className === 'barstile-checkbox-wrapper');
    const labelEl = checkWrapper.children.find(c => c.className === 'barstile-label');
    assert.equal(labelEl.textContent, 'Verification failed. Try again.');

    widget.destroy();
  });

  test('invisible mode triggers verification immediately upon instantiation', async () => {
    const container = mockDOM.createElement('div');
    const widget = renderWidget(container, {
      mode: 'invisible',
      challengeUrl: `${serverUrl}/api/barstile/challenge`,
      verifyUrl: `${serverUrl}/api/barstile/verify`
    });

    assert.equal(widget.getStatus(), 'solving');
    const token = await widget.verify();
    assert.ok(token);
    assert.equal(widget.getStatus(), 'verified');

    const hiddenInput = container.querySelector('input[name="barstile-token"]');
    assert.equal(hiddenInput.value, token);

    widget.destroy();
  });

  test('autoInitializeWidgets scans DOM and initializes widgets from HTML markers', async () => {
    const el1 = mockDOM.createElement('div');
    el1.className = 'barstile-widget';
    el1.setAttribute('data-mode', 'invisible');
    el1.setAttribute('data-challenge-url', `${serverUrl}/api/barstile/challenge`);
    el1.setAttribute('data-verify-url', `${serverUrl}/api/barstile/verify`);

    const el2 = mockDOM.createElement('div');
    el2.setAttribute('data-barstile', '');
    el2.setAttribute('data-challenge-url', `${serverUrl}/api/barstile/challenge`);
    el2.setAttribute('data-verify-url', `${serverUrl}/api/barstile/verify`);

    const widgets = autoInitializeWidgets();
    assert.equal(widgets.length, 2, 'Must initialize exactly 2 marked elements');

    const [tok1, tok2] = await Promise.all([widgets[0].verify(), widgets[1].verify()]);
    assert.ok(tok1);
    assert.ok(tok2);
    assert.equal(widgets[0].getStatus(), 'verified');
    assert.equal(widgets[1].getStatus(), 'verified');

    widgets.forEach(w => w.destroy());
  });

  test('retry after error state allows user to click box and successfully verify', async () => {
    const failContainer = mockDOM.createElement('div');
    const widget = renderWidget(failContainer, {
      challengeUrl: `${serverUrl}/api/barstile/challenge`,
      verifyUrl: `${serverUrl}/api/barstile/verify`,
      onError: () => {}
    });

    const root = failContainer.children.find(c => c.className === 'barstile-container');
    const checkWrapper = root.children.find(c => c.className === 'barstile-checkbox-wrapper');
    const boxEl = checkWrapper.children.find(c => c.getAttribute('role') === 'checkbox');

    // Force error by temporarily overriding fetch to reject
    const origFetch = globalThis.fetch;
    globalThis.fetch = () => Promise.reject(new Error('Network drop'));

    boxEl.click();
    await new Promise(r => setTimeout(r, 20));
    assert.equal(widget.getStatus(), 'error');

    // Restore fetch
    globalThis.fetch = origFetch;

    // Click again to retry
    boxEl.click();
    const token = await widget.verify();
    assert.ok(token);
    assert.equal(widget.getStatus(), 'verified');

    widget.destroy();
  });

  test('destroy detaches submit event listener from parent form', () => {
    const form = mockDOM.createElement('form');
    const container = mockDOM.createElement('div');
    form.appendChild(container);

    const widget = renderWidget(container, {
      challengeUrl: `${serverUrl}/api/barstile/challenge`,
      verifyUrl: `${serverUrl}/api/barstile/verify`
    });

    widget.destroy();

    let prevented = false;
    form.dispatchEvent({
      type: 'submit',
      preventDefault: () => {
        prevented = true;
      }
    });

    assert.equal(prevented, false, 'Form submit must not be intercepted after widget destroy');
  });

  test('POST /api/barstile/verify rejects request with missing telemetry when blockBots is active', async () => {
    const chalRes = await fetch(`${serverUrl}/api/barstile/challenge`);
    const chalData = await chalRes.json();
    const solveResult = await solveWorker(chalData.challenge);
    const solution = solveResult.solution || solveResult;

    // Send without telemetry header and body
    const verifyRes = await fetch(`${serverUrl}/api/barstile/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Barstile-Solution': solution
      },
      body: JSON.stringify({ solution })
    });

    assert.equal(verifyRes.status, 403);
    const body = await verifyRes.json();
    assert.equal(body.error, 'barstile_failed');
    assert.equal(body.reason, 'telemetry_required');
  });

  test('POST /api/barstile/verify rejects telemetry envelope with mismatched challenge salt', async () => {
    const chalRes = await fetch(`${serverUrl}/api/barstile/challenge`);
    const chalData = await chalRes.json();
    const solveResult = await solveWorker(chalData.challenge);
    const solution = solveResult.solution || solveResult;

    // Generate telemetry with wrong salt (replay attack from a different challenge)
    const probe = {
      automation: { isAutomated: false, markers: [] },
      anomalies: [],
      hardware: {}
    };
    const wrongSaltTelemetry = encodeProbeTelemetry(probe, 'wrong_salt_12345');

    const verifyRes = await fetch(`${serverUrl}/api/barstile/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Barstile-Solution': solution,
        'X-Barstile-Telemetry': wrongSaltTelemetry
      },
      body: JSON.stringify({
        solution,
        telemetry: wrongSaltTelemetry
      })
    });

    assert.equal(verifyRes.status, 403);
    const body = await verifyRes.json();
    assert.equal(body.error, 'barstile_failed');
    assert.equal(body.reason, 'telemetry_replay_detected');
  });

  test('keyboard Enter or Space in error state initiates fresh verification retry', async () => {
    const failContainer = mockDOM.createElement('div');
    const widget = renderWidget(failContainer, {
      challengeUrl: `${serverUrl}/api/barstile/challenge`,
      verifyUrl: `${serverUrl}/api/barstile/verify`,
      onError: () => {}
    });

    const root = failContainer.children.find(c => c.className === 'barstile-container');
    const checkWrapper = root.children.find(c => c.className === 'barstile-checkbox-wrapper');
    const boxEl = checkWrapper.children.find(c => c.getAttribute('role') === 'checkbox');

    // Force failure
    const origFetch = globalThis.fetch;
    globalThis.fetch = () => Promise.reject(new Error('Network error'));
    boxEl.dispatchEvent({ type: 'keydown', key: 'Enter', preventDefault: () => {} });
    await new Promise(r => setTimeout(r, 20));
    assert.equal(widget.getStatus(), 'error');

    // Restore and retry via Enter key
    globalThis.fetch = origFetch;
    boxEl.dispatchEvent({ type: 'keydown', key: 'Enter', preventDefault: () => {} });
    const token = await widget.verify();
    assert.ok(token);
    assert.equal(widget.getStatus(), 'verified');

    widget.destroy();
  });

  test('POST /api/barstile/verify returns HTTP 400 when solution token is missing', async () => {
    const probe = {
      automation: { isAutomated: false, markers: [] },
      anomalies: [],
      hardware: {}
    };
    const telemetry = encodeProbeTelemetry(probe, 'any_salt');

    const res = await fetch(`${serverUrl}/api/barstile/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Barstile-Telemetry': telemetry
      },
      body: JSON.stringify({ telemetry })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'solution_required');
  });

  test('POST /api/barstile/verify accepts valid solution with matching challenge salt and issues clearance', async () => {
    const chalRes = await fetch(`${serverUrl}/api/barstile/challenge`);
    const chalData = await chalRes.json();
    const solveResult = await solveWorker(chalData.challenge);
    const solution = solveResult.solution || solveResult;
    const [salt] = chalData.challenge.split('.');

    const probe = {
      automation: { isAutomated: false, markers: [] },
      anomalies: [],
      hardware: {}
    };
    const validTelemetry = encodeProbeTelemetry(probe, salt);

    const verifyRes = await fetch(`${serverUrl}/api/barstile/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Barstile-Solution': solution,
        'X-Barstile-Telemetry': validTelemetry
      },
      body: JSON.stringify({
        solution,
        telemetry: validTelemetry
      })
    });

    assert.equal(verifyRes.status, 200);
    assert.ok(verifyRes.headers.get('x-barstile-clearance'));
    assert.ok(verifyRes.headers.get('set-cookie'));
    const body = await verifyRes.json();
    assert.equal(body.verified, true);
    assert.ok(body.clearance);
  });

  test('destroy on container without parent form executes cleanly without error', () => {
    const standaloneContainer = mockDOM.createElement('div');
    const widget = renderWidget(standaloneContainer, {
      challengeUrl: `${serverUrl}/api/barstile/challenge`,
      verifyUrl: `${serverUrl}/api/barstile/verify`
    });

    assert.doesNotThrow(() => {
      widget.destroy();
    });
    assert.equal(standaloneContainer.innerHTML, '');
  });
});
