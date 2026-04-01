import { cn } from '@/lib/utils';

export interface AnimatedHeroProps {
  className?: string;
  headline?: string;
  subtext?: string;
  cta?: { label: string; href: string };
}

export function AnimatedHero({
  className,
  headline = 'The future is here',
  subtext = 'Experience the next generation of web technology.',
  cta = { label: 'Get Started', href: '#' },
}: AnimatedHeroProps) {
  return (
    <section
      className={cn(
        'relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20',
        className
      )}
    >
      {/* Animated gradient orbs */}
      <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-accent/10 blur-3xl delay-1000" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <h1 className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
          {headline}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          {subtext}
        </p>
        <div className="mt-10">
          <a
            href={cta.href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:shadow-xl hover:shadow-primary/30"
          >
            {cta.label}
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
