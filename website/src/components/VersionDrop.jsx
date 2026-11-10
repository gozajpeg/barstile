import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Trims redundant trailing zeros from semver strings with uppercase prefix:
 * - v1.0.0 -> V1
 * - v1.1.0 -> V1.1
 * - v1.0.1 -> V1.0.1
 * - 1.0.0  -> 1
 */
export function formatVersionDisplay(versionStr) {
  if (!versionStr) return '';
  const hasPrefix = /^v/i.test(versionStr);
  const clean = versionStr.replace(/^v/i, '');
  const [major = '0', minor = '0', patch = '0'] = clean.split('.');
  const prefix = hasPrefix ? 'V' : '';

  if (patch === '0' && minor === '0') {
    return `${prefix}${major}`;
  }
  if (patch === '0') {
    return `${prefix}${major}.${minor}`;
  }
  return `${prefix}${major}.${minor}.${patch}`;
}

export function getSideHeading(versionStr) {
  if (!versionStr) return 'Barstile 1';
  const clean = versionStr.replace(/^v/i, '');
  const [major = '1', minor = '0', patch = '0'] = clean.split('.');
  if (patch !== '0') {
    return `Barstile ${major}.${minor}.${patch}`;
  }
  if (minor !== '0') {
    return `Barstile ${major}.${minor}`;
  }
  return `Barstile ${major}`;
}

const CURRENT_VERSION = 'v1.0.0';

export function VersionDrop({ onNavigate }) {
  const displayVersion = formatVersionDisplay(CURRENT_VERSION);
  const sideHeading = getSideHeading(CURRENT_VERSION);

  return (
    <section
      id="version"
      className="w-full flex flex-col items-center justify-center px-6 py-24 sm:py-28 select-none overflow-hidden"
    >
      <div className="max-w-6xl w-full mx-auto">
        {/* Section Top Heading: Restored to original site-wide 24px pairing */}
        <div className="mb-14 sm:mb-20 text-center">
          <h2 className="text-[24px] font-semibold tracking-tight text-white leading-none">
            Barstile did it again.
          </h2>
          <p className="text-[24px] text-zinc-500 font-normal tracking-tight leading-none mt-0.5">
            Another version just dropped with improvements.
          </p>
        </div>

        {/* Device-Responsive Version Showcase: Side-by-side on desktop, stacked on mobile */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-24">
          {/* Big Version Mark */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <span className="text-9xl sm:text-[160px] md:text-[220px] lg:text-[260px] xl:text-[290px] font-sans font-extrabold text-white tracking-tighter leading-none select-none">
              {displayVersion}
            </span>
          </div>

          {/* Side Info: Heading, Subtext & Changelog Button */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-[24px] font-semibold tracking-tight text-white leading-none">
              {sideHeading}
            </h3>
            <p className="text-[24px] text-zinc-500 font-normal tracking-tight leading-none mt-0.5">
              is now released publicly!
            </p>

            <div className="mt-8">
              <button
                onClick={() => onNavigate && onNavigate('changelog')}
                className="relative h-10 inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden active:scale-95 transition-all shadow-sm group cursor-pointer"
              >
                {/* Base subtle border line */}
                <span className="absolute inset-0 rounded-full border border-white/[0.12]" />

                {/* Moving line at the outline (Prism Titanium beam) */}
                <span
                  className="absolute inset-[-150%] animate-border-beam pointer-events-none"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg 260deg, rgba(148, 163, 184, 0.15) 290deg, #94a3b8 320deg, #e2e8f0 345deg, #ffffff 355deg, transparent 360deg)'
                  }}
                />

                {/* Solid interior */}
                <span className="relative z-10 w-full h-full flex items-center justify-center gap-2 px-5 rounded-full bg-[#0d0f14] group-hover:bg-[#141720] text-xs font-medium text-zinc-300 group-hover:text-white transition-all whitespace-nowrap">
                  <span>Read full notes in Changelog</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-zinc-400 group-hover:text-white" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VersionDrop;
