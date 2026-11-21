/**
 * Barstile Turnstile-Style Drop-in Client Widget
 * Renders invisible or interactive verification widgets and automatically binds
 * clearance tokens to HTML forms.
 * Zero external CSS/JS dependencies.
 */

import { collectBrowserProbe, encodeProbeTelemetry } from './probe.js';
import { createBehaviorTracker } from './behavior.js';
import { solveWorker } from './worker.js';
import { syncServerTime, getServerTime } from './clock.js';

const sharedClearance = new Map();
const sharedInFlight = new Map();

/**
 * Clears the shared clearance token cache across widgets.
 */
export function clearSharedClearance() {
  sharedClearance.clear();
  sharedInFlight.clear();
}

function isTokenFresh(tok) {
  if (!tok || typeof tok !== 'string') return false;
  const parts = tok.split('.');
  if (parts.length === 4 || parts.length === 3) {
    const expIdx = parts.length === 4 ? 2 : 1;
    const exp = Number.parseInt(parts[expIdx], 10);
    if (!Number.isNaN(exp)) {
      return getServerTime() < (exp - 30_000);
    }
  }
  return true;
}

const WIDGET_STYLE = `
.barstile-container {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 10px 14px;
  min-width: 280px;
  user-select: none;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.barstile-checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}
.barstile-box {
  width: 24px;
  height: 24px;
  border: 2px solid #9ca3af;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease-in-out;
  background: #f9fafb;
}
.barstile-box:hover {
  border-color: #6b7280;
}
.barstile-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: barstile-spin 0.8s linear infinite;
}
@keyframes barstile-spin {
  to { transform: rotate(360deg); }
}
.barstile-check {
  color: #16a34a;
  font-size: 18px;
  font-weight: bold;
}
.barstile-label {
  color: #374151;
  font-weight: 500;
}
.barstile-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 10px;
  color: #9ca3af;
  line-height: 1.2;
}
.barstile-brand-title {
  font-weight: 600;
  color: #6b7280;
}
`;

/**
 * Injects default widget styles once into document head.
 */
function injectStyles(doc) {
  if (!doc || doc.getElementById('barstile-widget-styles')) return;
  const styleEl = doc.createElement('style');
  styleEl.id = 'barstile-widget-styles';
  styleEl.textContent = WIDGET_STYLE;
  doc.head?.appendChild(styleEl);
}

/**
 * Renders an interactive or invisible Barstile verification widget inside a container element.
 *
 * @param {HTMLElement|string} target - Container element or CSS selector
 * @param {Object} [options]
 * @param {'invisible' | 'interactive'} [options.mode='invisible']
 * @param {string} [options.challengeUrl='/api/barstile/challenge'] - Endpoint to fetch challenge token
 * @param {string} [options.verifyUrl='/api/barstile/verify'] - Endpoint to verify solution & telemetry
 * @param {Function} [options.onSuccess] - Callback when verified: (token) => void
 * @param {Function} [options.onError] - Callback on failure: (err) => void
 * @returns {Object} Widget instance controller
 */
export function renderWidget(target, {
  mode = 'invisible',
  challengeUrl = '/api/barstile/challenge',
  verifyUrl = '/api/barstile/verify',
  onSuccess = null,
  onError = null
} = {}) {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) {
    throw new Error(`[Barstile] Widget target container not found: ${target}`);
  }

  injectStyles(document);

  const tracker = createBehaviorTracker(window);
  let status = 'idle'; // 'idle' | 'solving' | 'verified' | 'error'
  let token = null;
  let pendingVerification = null;

  // Hidden form input injection
  let hiddenInput = container.querySelector('input[name="barstile-token"]');
  if (!hiddenInput) {
    hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'barstile-token';
    container.appendChild(hiddenInput);
  }

  // Pre-fill from shared clearance cache if fresh token exists for this verifyUrl
  const cachedInitial = sharedClearance.get(verifyUrl);
  if (cachedInitial && isTokenFresh(cachedInitial)) {
    token = cachedInitial;
    hiddenInput.value = token;
    status = 'verified';
  }

  let boxEl = null;
  let labelEl = null;

  if (mode === 'interactive') {
    container.innerHTML = '';
    container.appendChild(hiddenInput);

    const root = document.createElement('div');
    root.className = 'barstile-container';

    const checkWrapper = document.createElement('div');
    checkWrapper.className = 'barstile-checkbox-wrapper';

    boxEl = document.createElement('div');
    boxEl.className = 'barstile-box';
    boxEl.setAttribute('role', 'checkbox');
    boxEl.setAttribute('aria-checked', 'false');
    boxEl.tabIndex = 0;

    labelEl = document.createElement('span');
    labelEl.className = 'barstile-label';
    labelEl.textContent = 'Verify you are human';

    if (status === 'verified') {
      boxEl.innerHTML = '<span class="barstile-check">✓</span>';
      boxEl.style.borderColor = '#16a34a';
      boxEl.setAttribute('aria-checked', 'true');
      labelEl.textContent = 'Verified human';
    }

    checkWrapper.appendChild(boxEl);
    checkWrapper.appendChild(labelEl);

    const brand = document.createElement('div');
    brand.className = 'barstile-brand';
    brand.innerHTML = '<span class="barstile-brand-title">Barstile</span><span>Bot Protection</span>';

    root.appendChild(checkWrapper);
    root.appendChild(brand);
    container.appendChild(root);

    boxEl.addEventListener('click', () => {
      if (status === 'idle' || status === 'error') {
        executeVerification().catch(() => {});
      }
    });

    boxEl.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && (status === 'idle' || status === 'error')) {
        e.preventDefault();
        executeVerification().catch(() => {});
      }
    });
  }

  function executeVerification() {
    if (status === 'verified' && isTokenFresh(token)) return Promise.resolve(token);
    if (pendingVerification) return pendingVerification;

    const cached = sharedClearance.get(verifyUrl);
    if (cached && isTokenFresh(cached)) {
      token = cached;
      hiddenInput.value = token;
      status = 'verified';
      if (boxEl) {
        boxEl.innerHTML = '<span class="barstile-check">✓</span>';
        boxEl.style.borderColor = '#16a34a';
        boxEl.setAttribute('aria-checked', 'true');
        labelEl.textContent = 'Verified human';
      }
      if (typeof onSuccess === 'function') {
        onSuccess(token);
      }
      return Promise.resolve(token);
    }

    const inFlight = sharedInFlight.get(verifyUrl);
    if (inFlight) {
      status = 'solving';
      if (boxEl) {
        boxEl.innerHTML = '<div class="barstile-spinner"></div>';
        labelEl.textContent = 'Verifying...';
      }
      return inFlight.then((tok) => {
        token = tok;
        hiddenInput.value = token;
        status = 'verified';
        if (boxEl) {
          boxEl.innerHTML = '<span class="barstile-check">✓</span>';
          boxEl.style.borderColor = '#16a34a';
          boxEl.setAttribute('aria-checked', 'true');
          labelEl.textContent = 'Verified human';
        }
        if (typeof onSuccess === 'function') {
          onSuccess(token);
        }
        return token;
      }).catch((err) => {
        status = 'error';
        if (boxEl) {
          boxEl.innerHTML = '<span style="color:#dc2626;font-weight:bold;">✕</span>';
          boxEl.style.borderColor = '#dc2626';
          labelEl.textContent = 'Verification failed. Try again.';
        }
        if (typeof onError === 'function') {
          onError(err);
        }
        throw err;
      });
    }

    status = 'solving';

    if (boxEl) {
      boxEl.innerHTML = '<div class="barstile-spinner"></div>';
      labelEl.textContent = 'Verifying...';
    }

    pendingVerification = (async () => {
      try {
        // 1. Fetch challenge token from endpoint (with single retry on network error)
        let chalRes;
        try {
          chalRes = await fetch(challengeUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
        } catch {
          chalRes = await fetch(challengeUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
        }

        if (!chalRes.ok && chalRes.status !== 449) {
          throw new Error(`Failed to retrieve challenge: HTTP ${chalRes.status}`);
        }

        syncServerTime(chalRes);

        const chalData = await chalRes.json();
        const challengeToken = chalData.challenge || chalRes.headers.get('X-Barstile-Challenge');

        if (!challengeToken) {
          throw new Error('No challenge token returned from challenge endpoint');
        }

        // 2. Extract salt and gather client environment probe
        const [salt] = challengeToken.split('.');
        const probe = collectBrowserProbe(window);
        const probeEnvelope = encodeProbeTelemetry(probe, salt);
        const behavior = tracker.getTelemetry();

        // 3. Solve PoW in background worker
        const solveResult = await solveWorker(challengeToken);
        const solution = solveResult?.solution || solveResult;

        // 4. Submit solution and telemetry envelope to verifier
        let verifyRes = await fetch(verifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Barstile-Solution': solution,
            'X-Barstile-Telemetry': probeEnvelope
          },
          body: JSON.stringify({
            solution,
            telemetry: probeEnvelope,
            behavior
          })
        });

        // 5. If server escalates difficulty (HTTP 449), solve higher difficulty challenge and resubmit
        if (verifyRes.status === 449) {
          const retryData = await verifyRes.json();
          const escalatedChallenge = retryData.challenge || verifyRes.headers.get('X-Barstile-Challenge');
          if (escalatedChallenge) {
            const escalatedSolve = await solveWorker(escalatedChallenge);
            const escalatedSolution = escalatedSolve?.solution || escalatedSolve;
            verifyRes = await fetch(verifyUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Barstile-Solution': escalatedSolution,
                'X-Barstile-Telemetry': probeEnvelope
              },
              body: JSON.stringify({
                solution: escalatedSolution,
                telemetry: probeEnvelope,
                behavior
              })
            });
          }
        }

        syncServerTime(verifyRes);

        if (!verifyRes.ok) {
          throw new Error(`Verification rejected: HTTP ${verifyRes.status}`);
        }

        const verifyData = await verifyRes.json();
        const clearance = verifyData.clearance || verifyRes.headers.get('X-Barstile-Clearance');
        token = clearance || solution;
        if (clearance) {
          sharedClearance.set(verifyUrl, clearance);
        }

        // Update hidden input and UI state
        hiddenInput.value = token;
        status = 'verified';

        if (boxEl) {
          boxEl.innerHTML = '<span class="barstile-check">✓</span>';
          boxEl.style.borderColor = '#16a34a';
          boxEl.setAttribute('aria-checked', 'true');
          labelEl.textContent = 'Verified human';
        }

        if (typeof onSuccess === 'function') {
          onSuccess(token);
        }

        return token;
      } catch (err) {
        status = 'error';
        if (boxEl) {
          boxEl.innerHTML = '<span style="color:#dc2626;font-weight:bold;">✕</span>';
          boxEl.style.borderColor = '#dc2626';
          labelEl.textContent = 'Verification failed. Try again.';
        }
        if (typeof onError === 'function') {
          onError(err);
        }
        throw err;
      } finally {
        pendingVerification = null;
        sharedInFlight.delete(verifyUrl);
      }
    })();

    sharedInFlight.set(verifyUrl, pendingVerification);
    return pendingVerification;
  }

  // Automatic parent form submission interceptor
  const parentForm = container.closest('form');
  async function onFormSubmit(e) {
    if (status !== 'verified' || !isTokenFresh(token)) {
      const cached = sharedClearance.get(verifyUrl);
      if (cached && isTokenFresh(cached)) {
        token = cached;
        hiddenInput.value = token;
        status = 'verified';
        if (boxEl) {
          boxEl.innerHTML = '<span class="barstile-check">✓</span>';
          boxEl.style.borderColor = '#16a34a';
          boxEl.setAttribute('aria-checked', 'true');
          labelEl.textContent = 'Verified human';
        }
        if (typeof onSuccess === 'function') {
          onSuccess(token);
        }
        return;
      }

      e.preventDefault();
      try {
        await executeVerification();
        // Re-submit parent form natively once verified
        parentForm.submit();
      } catch {
        // Keep blocked on verification failure
      }
    }
  }

  if (parentForm) {
    parentForm.addEventListener('submit', onFormSubmit);
  }

  return {
    getToken: () => token,
    getStatus: () => status,
    verify: executeVerification,
    reset: () => {
      token = null;
      status = 'idle';
      hiddenInput.value = '';
      sharedClearance.delete(verifyUrl);
      if (boxEl) {
        boxEl.innerHTML = '';
        boxEl.style.borderColor = '#9ca3af';
        boxEl.setAttribute('aria-checked', 'false');
        labelEl.textContent = 'Verify you are human';
      }
    },
    destroy: () => {
      if (parentForm) {
        parentForm.removeEventListener('submit', onFormSubmit);
      }
      tracker.stop();
      container.innerHTML = '';
    }
  };
}

/**
 * Automatically scans document for elements matching .barstile-widget and initializes them.
 */
export function autoInitializeWidgets() {
  if (typeof document === 'undefined') return [];
  const widgets = [];
  const elements = document.querySelectorAll('.barstile-widget, [data-barstile]');
  for (const el of elements) {
    const mode = el.getAttribute('data-mode') || 'invisible';
    const challengeUrl = el.getAttribute('data-challenge-url') || '/api/barstile/challenge';
    const verifyUrl = el.getAttribute('data-verify-url') || '/api/barstile/verify';
    widgets.push(renderWidget(el, { mode, challengeUrl, verifyUrl }));
  }
  return widgets;
}
