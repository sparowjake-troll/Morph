import { cn } from '@/lib/utils';

export interface FeatureGridProps {
  className?: string;
  headline?: string;
  subtext?: string;
  features?: Array<{ title: string; description: string; icon?: React.ReactNode }>;
}

const DEFAULT_FEATURES = [
  { title: 'Fast Performance', description: 'Optimized for speed with modern build tools and lazy loading.' },
  { title: 'Type Safe', description: 'Built with TypeScript for reliable, maintainable code.' },
  { title: 'Responsive', description: 'Looks great on every device, from mobile to desktop.' },
  { title: 'Accessible', description: 'WCAG compliant with semantic HTML and ARIA attributes.' },
  { title: 'SEO Optimized', description: 'Server-rendered pages with proper meta tags and structured data.' },
  { title: 'Modern Stack', description: 'Next.js, Tailwind CSS, and shadcn/ui for a production-ready setup.' },
];

export function FeatureGrid({
  className,
  headline = 'Everything you need',
  subtext = 'A complete solution with all the features you need to build modern web applications.',
  features = DEFAULT_FEATURES,
}: FeatureGridProps) {
  return (
    <section className={cn('px-4 py-24', className)}>
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{headline}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{subtext}</p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border bg-card p-6">
              {feature.icon && <div className="mb-4 text-primary">{feature.icon}</div>}
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
