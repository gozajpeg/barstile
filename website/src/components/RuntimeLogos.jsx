import React from 'react';

const RUNTIMES = [
  { name: 'Node.js', icon: '/frameworks/nodejs.svg' },
  { name: 'Bun', icon: '/frameworks/bun.svg' },
  { name: 'Deno', icon: '/frameworks/deno.svg' },
  { name: 'Next.js', icon: '/frameworks/nextjs.svg' },
  { name: 'Express', icon: '/frameworks/express.svg' },
  { name: 'Fastify', icon: '/frameworks/fastify.svg' },
  { name: 'Cloudflare', icon: '/frameworks/cloudflare.svg' },
  { name: 'Hono', icon: '/frameworks/hono.svg' },
  { name: 'React', icon: '/frameworks/react.svg' },
  { name: 'Vue.js', icon: '/frameworks/vue.svg' },
  { name: 'Svelte', icon: '/frameworks/svelte.svg' },
  { name: 'Astro', icon: '/frameworks/astro.svg' },
  { name: 'Nuxt', icon: '/frameworks/nuxt.svg' },
  { name: 'Angular', icon: '/frameworks/angular.svg' },
  { name: 'SolidJS', icon: '/frameworks/solidjs.svg' },
  { name: 'Remix', icon: '/frameworks/remix.svg' },
  { name: 'Koa', icon: '/frameworks/koa.svg' },
];

export function RuntimeLogos() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-4 sm:gap-x-8 md:gap-x-10 gap-y-4 sm:gap-y-5 max-w-4xl mx-auto select-none">
      {RUNTIMES.map((rt) => (
        <div
          key={rt.name}
          className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 text-zinc-400 hover:text-zinc-200 transition-colors group cursor-default"
          title={rt.name}
        >
          <img
            src={rt.icon}
            alt={rt.name}
            className="w-5 h-5 sm:w-6 sm:h-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            loading="lazy"
          />
          <span className="text-xs sm:text-[14px] font-medium tracking-tight font-sans whitespace-nowrap">
            {rt.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default RuntimeLogos;
