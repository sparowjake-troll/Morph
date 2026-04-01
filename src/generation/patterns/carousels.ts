export interface CarouselPatternConfig {
  name: string;
  itemCount?: number;
  autoplay?: boolean;
}

export function generateCarouselPattern(config: CarouselPatternConfig): string {
  const { name, autoplay = false } = config;

  return `'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface ${name}Props {
  className?: string;
  children: React.ReactNode[];
  autoplay?: boolean;
  interval?: number;
}

export function ${name}({ className, children, autoplay = ${autoplay}, interval = 5000 }: ${name}Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const total = children.length;

  const goTo = useCallback((index: number) => {
    setCurrentIndex(((index % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || total <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, next, total]);

  // Touch/swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  }, [next, prev]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  }, [next, prev]);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      role="region"
      aria-roledescription="carousel"
      aria-label="${name}"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: \`translateX(-\${currentIndex * 100}%)\` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, index) => (
          <div
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={\`Slide \${index + 1} of \${total}\`}
            className="w-full flex-shrink-0"
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background"
            aria-label="Previous slide"
          >
            <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background"
            aria-label="Next slide"
          >
            <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.56501 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              )}
              aria-label={\`Go to slide \${index + 1}\`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
`;
}
