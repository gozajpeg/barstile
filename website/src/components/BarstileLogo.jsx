import React from 'react';

/**
 * BarstileLogo Component
 * The iconic dual-capsule "eyes" mark for Barstile:
 * Two solid rounded vertical capsules side-by-side representing
 * non-interactive observation and silent gate security.
 */
export function BarstileLogo({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Barstile Logo"
      {...props}
    >
      {/* Left eye capsule */}
      <rect x="11" y="18" width="33" height="64" rx="16.5" />
      {/* Right eye capsule */}
      <rect x="56" y="18" width="33" height="64" rx="16.5" />
    </svg>
  );
}

export default BarstileLogo;
