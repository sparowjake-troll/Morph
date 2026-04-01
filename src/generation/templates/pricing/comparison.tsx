import { cn } from '@/lib/utils';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  highlighted?: boolean;
}

export interface PricingComparisonProps {
  className?: string;
  headline?: string;
  tiers?: PricingTier[];
}

const DEFAULT_TIERS: PricingTier[] = [
  { name: 'Starter', price: '$9', description: 'Perfect for getting started', features: ['5 projects', '10GB storage', 'Email support'], cta: { label: 'Start Free', href: '#' } },
  { name: 'Pro', price: '$29', description: 'For growing teams', features: ['Unlimited projects', '100GB storage', 'Priority support', 'Custom domains', 'Analytics'], cta: { label: 'Get Pro', href: '#' }, highlighted: true },
  { name: 'Enterprise', price: '$99', description: 'For large organizations', features: ['Everything in Pro', '1TB storage', 'Dedicated support', 'SSO', 'SLA guarantee', 'Custom integrations'], cta: { label: 'Contact Sales', href: '#' } },
];

export function PricingComparison({ className, headline = 'Simple pricing', tiers = DEFAULT_TIERS }: PricingComparisonProps) {
  return (
    <section className={cn('px-4 py-24', className)}>
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{headline}</h2>
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.name} className={cn('flex flex-col rounded-2xl border p-8', tier.highlighted && 'border-primary shadow-lg ring-1 ring-primary')}>
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
              <div className="mt-6">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 text-primary" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3354 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <a href={tier.cta.href} className={cn('mt-8 block rounded-md px-4 py-2 text-center text-sm font-semibold', tier.highlighted ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border hover:bg-muted')}>
                {tier.cta.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
