'use client';

import { cn } from '@/lib/utils';

export interface VideoBgHeroProps {
  className?: string;
  headline?: string;
  subtext?: string;
  videoSrc?: string;
  cta?: { label: string; href: string };
}

export function VideoBgHero({
  className,
  headline = 'Immersive Experience',
  subtext = 'Powered by video and modern web technology.',
  videoSrc = '/videos/hero.mp4',
  cta = { label: 'Explore', href: '#' },
}: VideoBgHeroProps) {
  return (
    <section className={cn('relative flex min-h-screen items-center justify-center overflow-hidden', className)}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center text-white">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {headline}
        </h1>
        <p className="mt-6 text-lg leading-8 text-white/80">
          {subtext}
        </p>
        <div className="mt-10">
          <a
            href={cta.href}
            className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-black shadow-sm hover:bg-white/90"
          >
            {cta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
