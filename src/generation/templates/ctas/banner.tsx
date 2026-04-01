import { cn } from '@/lib/utils';

export interface CTABannerProps {
  className?: string;
  headline?: string;
  subtext?: string;
  cta?: { label: string; href: string };
}

export function CTABanner({ className, headline = 'Ready to get started?', subtext = 'Join thousands of users building amazing things.', cta = { label: 'Start Free', href: '#' } }: CTABannerProps) {
  return (
    <section className={cn('bg-primary px-4 py-16', className)}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">{headline}</h2>
        <p className="mt-4 text-lg text-primary-foreground/80">{subtext}</p>
        <div className="mt-8">
          <a href={cta.href} className="rounded-md bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-background/90">{cta.label}</a>
        </div>
      </div>
    </section>
  );
}
