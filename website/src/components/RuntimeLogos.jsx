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
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-6 sm:gap-x-10 md:gap-x-12 gap-y-3.5 sm:gap-y-4 max-w-4xl mx-auto select-none items-center justify-items-center sm:justify-items-start px-2">
      {COMPATIBLE_FRAMEWORKS.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-2.5 sm:gap-3 text-zinc-500 hover:text-zinc-200 transition-colors group cursor-default w-full justify-center sm:justify-start"
          title={item.name}
        >
          <img
            src={item.icon}
            alt={item.name}
            className="w-6 h-6 sm:w-7 sm:h-7 object-contain filter grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200 shrink-0"
            loading="lazy"
          />
          <span className="text-xs sm:text-sm font-medium tracking-tight font-sans whitespace-nowrap">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default RuntimeLogos;
