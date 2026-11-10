import React, { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

const SECTIONS = [
  {
    num: '01',
    title: 'What Barstile is',
    content: (
      <div className="space-y-4">
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          Barstile is open-source code you install in your own application. It runs directly on your own servers or cloud accounts.
        </p>
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          We do not run a hosted service, we do not proxy your web traffic, and we do not have central servers collecting your logs or visitor data.
        </p>
      </div>
    )
  },
  {
    num: '02',
    title: 'Who controls the data',
    content: (
      <div className="space-y-4">
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          When you use Barstile in your app, you are in charge of your own data. Your visitors connect directly to your servers, not to us.
        </p>
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          As project maintainers, we write and share the code under the MIT license. We never see your visitors, we never see their IP addresses, and we have no way to access your traffic.
        </p>
      </div>
    )
  },
  {
    num: '03',
    title: 'This website',
    content: (
      <div className="space-y-4">
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          This documentation website is hosted on Cloudflare Pages. When you load these pages, your browser connects directly to Cloudflare servers to fetch the static files. Cloudflare may process standard network request logs to deliver the files securely and protect against DDoS attacks.
        </p>
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          We do not use Google Analytics, advertising scripts, or cookies on this website. The fonts on this site (Inter and JetBrains Mono) are stored directly inside our own static files, so your browser never connects to third-party font servers.
        </p>
      </div>
    )
  },
  {
    num: '04',
    title: 'How bot checks work',
    content: (
      <div className="space-y-4">
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          Instead of recording mouse moves, checking battery levels, or guessing who a visitor is, Barstile uses a simple math puzzle called proof-of-work.
        </p>
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          The visitor browser solves the puzzle in the background and returns an answer. Your server checks if the answer is right and remembers it for a short time so it cannot be submitted again. That is the whole check.
        </p>
      </div>
    )
  },
  {
    num: '05',
    title: 'European privacy laws',
    content: (
      <div className="space-y-4">
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          Under European rules like the GDPR, using Barstile to protect your site against automated spam and attacks falls under legitimate interest (Article 6(1)(f)).
        </p>
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          The software does not build visitor profiles or store personal details. Once a temporary security token expires, your server clears it from memory.
        </p>
      </div>
    )
  },
  {
    num: '06',
    title: 'Cookies and local storage',
    content: (
      <div className="space-y-4">
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          Barstile does not use cookies for advertising or tracking. Any temporary token it uses is strictly there to remember that a visitor solved the challenge so they can use your site normally.
        </p>
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          Because this is strictly for security and basic operation, European cookie rules allow it without requiring a cookie banner.
        </p>
      </div>
    )
  },
  {
    num: '07',
    title: 'California privacy laws',
    content: (
      <div className="space-y-4">
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          We do not sell, rent, or share personal information with anyone. We do not collect sensitive details like financial accounts or precise locations.
        </p>
      </div>
    )
  },
  {
    num: '08',
    title: 'Inspect the code yourself',
    content: (
      <div className="space-y-4">
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          Every line of code is public under the MIT license. You or your team can read the repository directly to see how it works and verify there are no hidden trackers:
        </p>
        <div className="pt-1">
          <a
            href="https://github.com/gozajpeg/barstile"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[16px] sm:text-[24px] text-zinc-300 hover:text-white font-normal tracking-tight transition-colors group"
          >
            <span className="underline underline-offset-4 decoration-zinc-600 group-hover:decoration-white">github.com/gozajpeg/barstile</span>
            <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
          </a>
        </div>
      </div>
    )
  },
  {
    num: '09',
    title: 'Questions and security reports',
    content: (
      <div className="space-y-4">
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          If you have questions about privacy or find a security issue in the library, please open an issue or advisory on GitHub at{' '}
          <a
            href="https://github.com/gozajpeg/barstile/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 hover:text-white underline underline-offset-4 decoration-zinc-600 hover:decoration-white transition-colors"
          >
            github.com/gozajpeg/barstile/issues
          </a>
          .
        </p>
        <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-relaxed">
          We update this document when we make changes to how the project or website operates.
        </p>
      </div>
    )
  }
];

export function PrivacyPage({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#07080a] text-[#ECEFF4] px-6 py-12 md:py-20 select-none">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <button
            onClick={() => {
              onNavigate('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Overview</span>
          </button>
        </div>

        {/* Editorial Header strictly following site-wide 24px typography convention */}
        <div className="pb-12 border-b border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-tight sm:leading-none">
                Privacy Policy.
              </h1>
              <p className="text-[16px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-snug sm:leading-none mt-1 sm:mt-0.5">
                How we handle data on this website and in our code.
              </p>
            </div>
            <div className="text-xs text-zinc-500 font-mono self-start sm:self-auto shrink-0">
              Effective: November 2026
            </div>
          </div>
        </div>

        {/* Legal Policy Content: Headings in 24px text-white, Contents in 24px text-zinc-500 */}
        <div className="divide-y divide-white/[0.08]">
          {SECTIONS.map((sec) => (
            <section key={sec.num} className="py-14 space-y-6">
              <h2 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-snug">
                {sec.num}. {sec.title}
              </h2>

              <div className="pt-1">
                {sec.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
