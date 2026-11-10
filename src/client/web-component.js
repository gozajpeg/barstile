import { renderWidget } from './widget.js';

class FallbackElement {
  constructor() {
    this._attributes = {};
    this.children = [];
    this.style = {};
  }

  getAttribute(name) {
    return this._attributes[name] !== undefined ? this._attributes[name] : null;
  }

  setAttribute(name, val) {
    this._attributes[name] = String(val);
  }

  removeAttribute(name) {
    delete this._attributes[name];
  }

  querySelector(sel) {
    if (sel === 'input[name="barstile-token"]') {
      return this.children.find(c => c.tagName === 'INPUT' && c.name === 'barstile-token') || null;
    }
    return null;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  closest(sel) {
    let curr = this.parentNode;
    while (curr) {
      if (sel === 'form' && curr.tagName === 'FORM') return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  addEventListener(evt, fn) {
    this._listeners = this._listeners || {};
    this._listeners[evt] = this._listeners[evt] || [];
    this._listeners[evt].push(fn);
  }

  removeEventListener(evt, fn) {
    if (this._listeners && this._listeners[evt]) {
      this._listeners[evt] = this._listeners[evt].filter(f => f !== fn);
    }
  }

  dispatchEvent(evt) {
    const fns = (this._listeners && this._listeners[evt.type]) || [];
    for (const fn of fns) {
      fn(evt);
    }
    return true;
  }
}

const BaseElement = typeof HTMLElement !== 'undefined' ? HTMLElement : FallbackElement;

/**
 * Native HTML5 Custom Element `<barstile-widget>`.
 * Embeddable across React, Vue, Svelte, Angular, Solid, and standard HTML.
 */
export class BarstileWidgetElement extends BaseElement {
  static get observedAttributes() {
    return ['data-mode', 'data-challenge-url', 'data-verify-url'];
  }

  constructor() {
    super();
    this._widget = null;
  }

  connectedCallback() {
    if (this._widget) return;

    const mode = this.getAttribute('data-mode') || 'interactive';
    const challengeUrl = this.getAttribute('data-challenge-url') || '/api/barstile/challenge';
    const verifyUrl = this.getAttribute('data-verify-url') || '/api/barstile/verify';

    this._widget = renderWidget(this, {
      mode,
      challengeUrl,
      verifyUrl,
      onSuccess: (token) => {
        this.dispatchEvent(new CustomEvent('barstile-success', {
          detail: { token },
          bubbles: true,
          composed: true
        }));
      },
      onError: (error) => {
        this.dispatchEvent(new CustomEvent('barstile-error', {
          detail: { error },
          bubbles: true,
          composed: true
        }));
      }
    });
  }

  disconnectedCallback() {
    if (this._widget && typeof this._widget.destroy === 'function') {
      this._widget.destroy();
      this._widget = null;
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.isConnected && this._widget) {
      this.disconnectedCallback();
      this.connectedCallback();
    }
  }

  getToken() {
    return this._widget ? this._widget.getToken() : null;
  }

  getStatus() {
    return this._widget ? this._widget.getStatus() : 'idle';
  }

  verify() {
    return this._widget ? this._widget.verify() : Promise.reject(new Error('Widget not connected'));
  }

  destroy() {
    this.disconnectedCallback();
  }
}

// Auto-register custom element if customElements API is available in environment
if (typeof customElements !== 'undefined' && !customElements.get('barstile-widget')) {
  customElements.define('barstile-widget', BarstileWidgetElement);
}
