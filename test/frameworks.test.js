import { test, describe, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { barstileMiddleware } from '../src/server/middleware.js';
import { createBarstile } from '../src/server/barstile.js';
import { BarstileWidgetElement } from '../src/client/web-component.js';
import { BarstileWidget } from '../src/frameworks/react.js';

function createMockDOM() {
  const elementsById = new Map();

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
      removeAttribute(k) {
        delete attributes[k];
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
        return true;
      },
      click() {
        this.dispatchEvent({ type: 'click' });
      }
    };

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
      return null;
    },
    querySelectorAll() {
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

describe('Zero-Dependency Framework Bindings', () => {
  let server;
  let serverUrl;
  let origDoc;
  let origWin;
  let origReact;
  let mockDOM;

  before(async () => {
    const engine = createBarstile({ difficulty: 1 });
    const middleware = barstileMiddleware({ difficulty: 1, engine });

    server = http.createServer((req, res) => {
      middleware(req, res, () => {
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true }));
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
    origReact = globalThis.React;

    mockDOM = createMockDOM();
    globalThis.document = mockDOM.doc;
    globalThis.window = mockDOM.win;
  });

  afterEach(() => {
    globalThis.document = origDoc;
    globalThis.window = origWin;
    globalThis.React = origReact;
  });

  describe('Native HTML5 Web Component (<barstile-widget>)', () => {
    test('BarstileWidgetElement observes attributes and exposes lifecycle methods', () => {
      const el = new BarstileWidgetElement();
      el.getAttribute = (attr) => {
        if (attr === 'data-challenge-url') return `${serverUrl}/api/barstile/challenge`;
        if (attr === 'data-verify-url') return `${serverUrl}/api/barstile/verify`;
        if (attr === 'data-mode') return 'interactive';
        return null;
      };

      assert.deepEqual(BarstileWidgetElement.observedAttributes, [
        'data-mode',
        'data-challenge-url',
        'data-verify-url'
      ]);

      assert.equal(el.getStatus(), 'idle');
      assert.equal(el.getToken(), null);
    });

    test('BarstileWidgetElement dispatches barstile-success CustomEvent upon verification', async () => {
      const el = new BarstileWidgetElement();
      const attrs = {
        'data-challenge-url': `${serverUrl}/api/barstile/challenge`,
        'data-verify-url': `${serverUrl}/api/barstile/verify`,
        'data-mode': 'interactive'
      };

      el.getAttribute = (k) => attrs[k] || null;
      el.setAttribute = (k, v) => { attrs[k] = v; };

      let successEventReceived = null;
      el.dispatchEvent = (evt) => {
        if (evt.type === 'barstile-success') {
          successEventReceived = evt;
        }
      };

      // Connect element to mock DOM
      el.connectedCallback();
      assert.equal(el.getStatus(), 'idle');

      const token = await el.verify();
      assert.ok(token);
      assert.equal(el.getStatus(), 'verified');
      assert.equal(el.getToken(), token);

      assert.ok(successEventReceived);
      assert.equal(successEventReceived.detail.token, token);

      // Disconnect cleanly
      el.disconnectedCallback();
      assert.equal(el.getToken(), null);
    });
  });

  describe('Zero-Dependency React Component (BarstileWidget)', () => {
    test('BarstileWidget renders empty element on server when window is undefined', () => {
      globalThis.window = undefined;

      let elementRendered = null;
      globalThis.React = {
        createElement(tag, props) {
          elementRendered = { tag, props };
          return elementRendered;
        },
        useRef(init) {
          return { current: init };
        },
        useEffect() {}
      };

      const result = BarstileWidget({
        className: 'custom-widget-class',
        style: { margin: '10px' }
      });

      assert.ok(result);
      assert.equal(result.tag, 'div');
      assert.equal(result.props.className, 'custom-widget-class');
      assert.deepEqual(result.props.style, { margin: '10px' });
    });

    test('BarstileWidget mounts renderWidget in browser and cleans up on unmount', () => {
      const containerDiv = mockDOM.createElement('div');
      let cleanupFunction = null;
      const effectQueue = [];

      globalThis.React = {
        createElement(tag, props) {
          if (props && props.ref) {
            props.ref.current = containerDiv;
          }
          return { tag, props };
        },
        useRef(init) {
          return { current: init };
        },
        useEffect(effect) {
          effectQueue.push(effect);
        }
      };

      let successToken = null;
      BarstileWidget({
        challengeUrl: `${serverUrl}/api/barstile/challenge`,
        verifyUrl: `${serverUrl}/api/barstile/verify`,
        onSuccess: (tok) => {
          successToken = tok;
        }
      });

      // Commit phase: React triggers effects after DOM element is created and ref bound
      for (const effect of effectQueue) {
        cleanupFunction = effect();
      }

      assert.ok(containerDiv.querySelector('input[name="barstile-token"]'));
      assert.equal(typeof cleanupFunction, 'function');

      // Unmount cleanup
      cleanupFunction();
      assert.equal(containerDiv.children.length, 0);
    });
  });
});
