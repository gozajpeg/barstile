import React from 'react';

const COMPATIBLE_FRAMEWORKS = [
  { name: 'Node.js', icon: '/frameworks/nodejs.png' },
  { name: 'Next.js', icon: '/frameworks/nextjs.png' },
  { name: 'React', icon: '/frameworks/react.png' },
  { name: 'Vue', icon: '/frameworks/vue.png' },
  { name: 'Svelte', icon: '/frameworks/svelte.png' },
  { name: 'Express', icon: '/frameworks/express.png' },
  { name: 'Fastify', icon: '/frameworks/fastify.png' },
  { name: 'Bun', icon: '/frameworks/bun.png' },
  { name: 'Deno', icon: '/frameworks/deno.png' },
  { name: 'Cloudflare', icon: '/frameworks/cloudflare.png' },
  { name: 'Astro', icon: '/frameworks/astro.png' },
  { name: 'Hono', icon: '/frameworks/hono.png' },
  { name: 'Nuxt', icon: '/frameworks/nuxt.png' },
  { name: 'Angular', icon: '/frameworks/angular.png' },
  { name: 'Koa', icon: '/frameworks/koa.png' }
];

export function RuntimeLogos() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-4 sm:gap-x-8 md:gap-x-10 gap-y-2.5 sm:gap-y-3 max-w-3xl mx-auto select-none">
      {COMPATIBLE_FRAMEWORKS.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-center sm:justify-start gap-2 px-2 py-1 rounded-md text-zinc-400 hover:text-white transition-colors group cursor-default"
          title={item.name}
        >
          <img
            src={item.icon}
            alt={item.name}
            className="w-4 h-4 sm:w-5 sm:h-5 object-contain rounded-sm filter brightness-95 group-hover:brightness-110 transition-all shrink-0"
            loading="lazy"
          />
          <span className="text-xs sm:text-[13px] font-medium tracking-tight font-sans whitespace-nowrap">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default RuntimeLogos;
