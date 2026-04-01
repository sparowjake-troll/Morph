import { cn } from '@/lib/utils';

export interface CenteredHeroProps {
  className?: string;
  headline?: string;
  subtext?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function CenteredHero({
  className,
  headline = 'Build something amazing',
  subtext = 'A modern solution for modern problems. Get started today and see the difference.',
  primaryCta = { label: 'Get Started', href: '#' },
  secondaryCta = { label: 'Learn More', href: '#' },
}: CenteredHeroProps) {
  return (
    <section className={cn('flex min-h-[80vh] items-center justify-center px-4 py-24', className)}>
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {headline}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {subtext}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href={primaryCta.href}
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            {primaryCta.label}
          </a>
          <a
            href={secondaryCta.href}
            className="text-sm font-semibold leading-6 text-foreground hover:text-foreground/80"
          >
            {secondaryCta.label} <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
