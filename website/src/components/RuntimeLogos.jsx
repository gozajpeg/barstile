import React from 'react';

const FRAMEWORKS = [
  { name: 'Node.js', icon: '/frameworks/nodejs.svg' },
  { name: 'Bun', icon: '/frameworks/bun.svg' },
  { name: 'Deno', icon: '/frameworks/deno.svg' },
  { name: 'Next.js', icon: '/frameworks/nextjs.svg' },
  { name: 'Express', icon: '/frameworks/express.svg' },
  { name: 'React', icon: '/frameworks/react.svg' },
  { name: 'Vue', icon: '/frameworks/vue.svg' },
  { name: 'Svelte', icon: '/frameworks/svelte.svg' },
  { name: 'Fastify', icon: '/frameworks/fastify.svg' },
  { name: 'Hono', icon: '/frameworks/hono.svg' },
  { name: 'Astro', icon: '/frameworks/astro.svg' },
  { name: 'Angular', icon: '/frameworks/angular.svg' },
  { name: 'Solid', icon: '/frameworks/solidjs.svg' },
  { name: 'Remix', icon: '/frameworks/remix.svg' },
  { name: 'Koa', icon: '/frameworks/koa.svg' }
];

export function RuntimeLogos() {
  return (
    <div className="w-screen max-w-none flex justify-center select-none overflow-visible">
      <div className="flex flex-nowrap items-center justify-center gap-x-8 sm:gap-x-12 shrink-0">
        {FRAMEWORKS.map((fw) => (
          <div
            key={fw.name}
            className="flex items-center gap-2.5 sm:gap-3 text-zinc-500 hover:text-zinc-300 transition-colors group cursor-default shrink-0"
            title={fw.name}
          >
            <img
              src={fw.icon}
              alt={fw.name}
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain transition-transform group-hover:scale-105 shrink-0"
              loading="lazy"
            />
            <span className="text-sm sm:text-[15px] font-medium tracking-tight font-sans whitespace-nowrap">
              {fw.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RuntimeLogos;
