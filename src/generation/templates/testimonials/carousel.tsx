'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Testimonial { name: string; role: string; quote: string; avatar?: string }

export interface TestimonialCarouselProps {
  className?: string;
  testimonials?: Testimonial[];
}

const DEFAULTS: Testimonial[] = [
  { name: 'Jane Smith', role: 'CEO, Acme Inc', quote: 'This product transformed our workflow completely.' },
  { name: 'John Doe', role: 'CTO, StartupCo', quote: 'Best tool we\'ve used. Incredible performance.' },
  { name: 'Sarah Johnson', role: 'Designer, Studio', quote: 'Beautiful, intuitive, and powerful. Love it.' },
];

export function TestimonialCarousel({ className, testimonials = DEFAULTS }: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);
  const current = testimonials[index];
  const total = testimonials.length;

  return (
    <section className={cn('px-4 py-24', className)}>
      <div className="mx-auto max-w-3xl text-center">
        <blockquote className="text-2xl font-medium italic leading-relaxed">
          &ldquo;{current.quote}&rdquo;
        </blockquote>
        <div className="mt-8">
          <p className="font-semibold">{current.name}</p>
          <p className="text-sm text-muted-foreground">{current.role}</p>
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={cn('h-2 w-2 rounded-full', i === index ? 'bg-primary' : 'bg-muted')} aria-label={`Testimonial ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
