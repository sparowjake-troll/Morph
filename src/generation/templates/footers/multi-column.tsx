import { cn } from '@/lib/utils';

interface FooterColumn { title: string; links: Array<{ label: string; href: string }> }

export interface MultiColumnFooterProps {
  className?: string;
  brand?: string;
  description?: string;
  columns?: FooterColumn[];
  copyright?: string;
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  { title: 'Product', links: [{ label: 'Features', href: '#' }, { label: 'Pricing', href: '#' }, { label: 'Changelog', href: '#' }] },
  { title: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Careers', href: '#' }] },
  { title: 'Legal', links: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }] },
];

export function MultiColumnFooter({ className, brand = 'Morph', description = 'Clone any website into clean code.', columns = DEFAULT_COLUMNS, copyright }: MultiColumnFooterProps) {
  return (
    <footer className={cn('border-t px-4 py-16', className)}>
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold">{brand}</p>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-4 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}><a href={link.href} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t pt-8">
        <p className="text-sm text-muted-foreground">{copyright || `© ${new Date().getFullYear()} ${brand}. All rights reserved.`}</p>
      </div>
    </footer>
  );
}
