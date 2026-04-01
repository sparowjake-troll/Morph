import { cn } from '@/lib/utils';

export interface SplitHeroProps {
  className?: string;
  headline?: string;
  subtext?: string;
  imageSrc?: string;
  imageAlt?: string;
  cta?: { label: string; href: string };
}

export function SplitHero({
  className,
  headline = 'Your headline here',
  subtext = 'Describe your product or service in a compelling way.',
  imageSrc = '/images/hero.jpg',
  imageAlt = 'Hero image',
  cta = { label: 'Get Started', href: '#' },
}: SplitHeroProps) {
  return (
    <section className={cn('px-4 py-24', className)}>
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {headline}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            {subtext}
          </p>
          <div className="mt-8">
            <a
              href={cta.href}
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              {cta.label}
            </a>
          </div>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          <img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  );
}
