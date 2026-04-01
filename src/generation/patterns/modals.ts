export interface ModalPatternConfig {
  name: string;
  title?: string;
}

export function generateModalPattern(config: ModalPatternConfig): string {
  const { name, title = 'Dialog' } = config;

  return `'use client';

import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface ${name}Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export function ${name}({ open, onClose, title = '${title}', className, children }: ${name}Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      dialog.showModal();
    } else {
      dialog.close();
      previousActiveElement.current?.focus();
    }
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  }, [onClose]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className={cn(
        'fixed inset-0 z-50 m-auto max-h-[85vh] w-full max-w-lg rounded-lg bg-background p-0 shadow-lg backdrop:bg-black/50',
        className
      )}
      aria-labelledby="modal-title"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </dialog>
  );
}
`;
}
