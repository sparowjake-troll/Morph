export interface AccordionPatternConfig {
  name: string;
  items: Array<{ id: string; title: string }>;
  allowMultiple?: boolean;
}

export function generateAccordionPattern(config: AccordionPatternConfig): string {
  const { name, items, allowMultiple = false } = config;

  return `'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface ${name}Props {
  className?: string;
  items?: Array<{ id: string; title: string; content: React.ReactNode }>;
  allowMultiple?: boolean;
}

const DEFAULT_ITEMS = ${JSON.stringify(items, null, 2)};

export function ${name}({ className, items = DEFAULT_ITEMS as unknown as ${name}Props['items'], allowMultiple = ${allowMultiple} }: ${name}Props) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = useCallback((id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }, [allowMultiple]);

  return (
    <div className={cn('divide-y divide-border rounded-lg border', className)}>
      {items?.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div key={item.id}>
            <button
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              aria-controls={\`accordion-\${item.id}\`}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50"
            >
              {item.title}
              <svg
                className={cn('h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-180')}
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
              </svg>
            </button>
            <div
              id={\`accordion-\${item.id}\`}
              role="region"
              hidden={!isOpen}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 text-sm text-muted-foreground">
                {item.content || 'Content goes here'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
`;
}
