import { renderWidget } from '../client/widget.js';

const reactPkg = await import('react').catch(() => null);

/**
 * Barstile Turnstile-style verification component for React and Next.js.
 * Zero external runtime dependencies, SSR safe, and unmount clean.
 *
 * @param {Object} props
 * @param {'interactive' | 'invisible'} [props.mode='interactive']
 * @param {string} [props.challengeUrl='/api/barstile/challenge']
 * @param {string} [props.verifyUrl='/api/barstile/verify']
 * @param {(token: string) => void} [props.onSuccess]
 * @param {(error: Error) => void} [props.onError]
 * @param {string} [props.className]
 * @param {Object} [props.style]
 * @returns {any}
 */
export function BarstileWidget({
  mode = 'interactive',
  challengeUrl = '/api/barstile/challenge',
  verifyUrl = '/api/barstile/verify',
  onSuccess,
  onError,
  className,
  style
}) {
  const React = reactPkg?.default || reactPkg || (typeof globalThis !== 'undefined' ? globalThis.React : null);
  if (!React || typeof React.createElement !== 'function') {
    throw new Error('BarstileWidget requires "react" peer dependency to be installed.');
  }

  const containerRef = React.useRef(null);
  const widgetRef = React.useRef(null);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const widget = renderWidget(containerRef.current, {
      mode,
      challengeUrl,
      verifyUrl,
      onSuccess,
      onError
    });
    widgetRef.current = widget;

    return () => {
      if (widgetRef.current && typeof widgetRef.current.destroy === 'function') {
        widgetRef.current.destroy();
        widgetRef.current = null;
      }
    };
  }, [mode, challengeUrl, verifyUrl]);

  return React.createElement('div', {
    ref: containerRef,
    className: className || undefined,
    style: style || undefined,
    'data-barstile-root': ''
  });
}

export default BarstileWidget;
