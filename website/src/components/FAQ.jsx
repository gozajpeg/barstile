import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'How is Barstile different from Cloudflare Turnstile or Google reCAPTCHA?',
    answer:
      'Barstile runs entirely on your own infrastructure with zero external network calls. Unlike Cloudflare or Google, Barstile never sets third-party tracking cookies, never requires an external cloud verification ping, and is unaffected by third-party cloud service outages. The proof-of-work handshake happens entirely between the visitor and your server.'
  },
  {
    question: 'Does client-side Proof-of-Work drain mobile battery or freeze the page?',
    answer:
      'No. At difficulty 3 (recommended for web forms and interactive endpoints), the cryptographic challenge resolves in 5 to 20 milliseconds on modern CPUs. In browser environments, the computation runs inside an isolated Web Worker off the main UI thread, avoiding UI frame drops and minimizing CPU overhead for human visitors.'
  },
  {
    question: 'How does Barstile scale across multi-server or load-balanced clusters?',
    answer:
      'Barstile exports a built-in Redis replay store (RedisReplayStore) alongside its standard in-memory cache. Replay tokens and sliding-window rate tracking can be shared across load-balanced Node.js or Bun instances with low-latency atomic Redis lookups.'
  },
  {
    question: 'Can attackers pre-compute challenge solutions in advance?',
    answer:
      'No. Every challenge token is cryptographically signed using an HMAC secret known only to your server. Challenge nonces include high-entropy randomness, a client environment fingerprint, and a strict time-to-live (default 60 seconds). Pre-computed or expired tokens fail validation.'
  },
  {
    question: 'Which backend and frontend frameworks are supported?',
    answer:
      'On the backend, Barstile natively supports Node.js 18+, Express, Fastify, Connect, and standard node:http servers. On the frontend, it works with React, Next.js, Bun, Vite, and standard HTML5 custom elements (<barstile-widget>).'
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="w-full flex flex-col items-center justify-center px-6 py-24 select-none"
    >
      <div className="max-w-4xl w-full mx-auto">
        {/* Section Top Heading */}
        <div className="mb-14 text-center">
          <h2 className="text-[24px] font-semibold tracking-tight text-white leading-none">
            Frequently asked questions.
          </h2>
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full py-5 flex items-center justify-between text-left group focus:outline-none"
                >
                  <span className="text-[15px] sm:text-[16px] font-medium text-zinc-200 group-hover:text-white transition-colors pr-6">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 group-hover:text-zinc-300 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? 'max-h-72 opacity-100 pb-5' : 'max-h-0 opacity-0 pb-0'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
