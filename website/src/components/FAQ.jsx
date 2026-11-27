import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'How is Barstile different from Cloudflare Turnstile or Google reCAPTCHA?',
    answer:
      'Barstile runs completely on your own server with zero external network calls. It never sets third-party tracking cookies, never pings an outside cloud service, and keeps working even if third-party cloud providers go down. The verification happens directly between the visitor and your backend.'
  },
  {
    question: 'Will Barstile accidentally block real visitors or privacy browsers?',
    answer:
      'No. Traditional bot tools often show an error or puzzle failure when visitors use privacy browsers, extensions, or VPNs. Instead of hard-blocking, Barstile simply asks for a slightly harder math puzzle. A real human browser still solves it in a few milliseconds and continues smoothly without getting locked out.'
  },
  {
    question: 'Does client-side Proof-of-Work drain battery or freeze the page?',
    answer:
      'No. At difficulty 3 (recommended for web forms), the math puzzle usually solves in 5 to 25 milliseconds on desktop devices. In browsers, the calculation runs in a background Web Worker so your page never freezes and scrolling stays smooth.'
  },
  {
    question: 'How does Barstile scale across multiple servers?',
    answer:
      'Barstile includes a built-in Redis store (RedisReplayStore) alongside its local memory cache. If you run multiple servers behind a load balancer, connect Redis so all servers share solved tokens and rate limits.'
  },
  {
    question: 'Can attackers calculate puzzle answers in advance?',
    answer:
      'No. Every challenge is signed with a secret key known only to your server. Each challenge includes random data, client details, and a 60-second expiration time. Pre-computed or expired answers are immediately rejected.'
  },
  {
    question: 'Which frameworks are supported?',
    answer:
      'On the backend, Barstile supports Node.js 18+, Express, Fastify, Connect, Next.js App Router (via handleRequest and verifyAction), Cloudflare Workers, Hono, Bun, and standard node:http. On the frontend, it works with React, Next.js, Vite, and standard HTML custom elements (<barstile-widget>).'
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
      className="w-full flex flex-col items-center justify-center px-6 sm:px-12 py-24 select-none content-lazy"
    >
      <div className="max-w-5xl w-full mx-auto">
        {/* Section Top Heading */}
        <div className="mb-14 sm:mb-16 text-center">
          <h2 className="text-[20px] sm:text-[24px] font-semibold tracking-tight text-white leading-none">
            Frequently asked questions.
          </h2>
          <p className="text-[20px] sm:text-[24px] text-zinc-500 font-normal tracking-tight leading-none mt-1 sm:mt-0.5">
            Everything you need to know.
          </p>
        </div>

        {/* Accordion List - Matched to max-w-5xl so widths align flush with Benchmarks */}
        <div className="w-full divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full py-6 flex items-center justify-between text-left group focus:outline-none cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span
                    id={`faq-question-${idx}`}
                    className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-zinc-200 group-hover:text-white transition-colors pr-6 leading-snug"
                  >
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-500 group-hover:text-zinc-300 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? 'max-h-[600px] opacity-100 pb-6' : 'max-h-0 opacity-0 pb-0'
                  }`}
                >
                  <p className="text-base text-zinc-400 font-normal leading-relaxed max-w-4xl">
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
