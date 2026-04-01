import { cn } from '@/lib/utils';

export interface MinimalHeroProps {
  className?: string;
  headline?: string;
}

export function MinimalHero({
  className,
  headline = 'Simple. Clean. Effective.',
}: MinimalHeroProps) {
  return (
    <section className={cn('flex min-h-[60vh] items-center justify-center px-4', className)}>
      <h1 className="max-w-4xl text-center text-5xl font-bold tracking-tight sm:text-7xl">
        {headline}
      </h1>
    </section>
  );
}
