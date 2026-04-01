export interface DropdownPatternConfig {
  name: string;
  items: Array<{ id: string; label: string }>;
}

export function generateDropdownPattern(config: DropdownPatternConfig): string {
  const { name, items } = config;

  return `'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface ${name}Props {
  className?: string;
  label?: string;
  items?: Array<{ id: string; label: string; onClick?: () => void }>;
}

export function ${name}({ className, label = 'Menu', items = [] }: ${name}Props) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setFocusIndex(0);
        } else {
          setFocusIndex((prev) => Math.min(prev + 1, items.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Escape':
        setOpen(false);
        setFocusIndex(-1);
        break;
      case 'Enter':
      case ' ':
        if (open && focusIndex >= 0) {
          items[focusIndex]?.onClick?.();
          setOpen(false);
        } else {
          setOpen(true);
          setFocusIndex(0);
        }
        break;
    }
  }, [open, focusIndex, items]);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)} onKeyDown={handleKeyDown}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1 rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted"
      >
        {label}
        <svg className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-md border bg-background py-1 shadow-md"
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              role="menuitem"
              tabIndex={index === focusIndex ? 0 : -1}
              onClick={() => { item.onClick?.(); setOpen(false); }}
              className={cn(
                'block w-full px-3 py-2 text-left text-sm hover:bg-muted',
                index === focusIndex && 'bg-muted'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
`;
}
