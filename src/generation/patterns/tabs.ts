export interface TabsPatternConfig {
  name: string;
  tabs: Array<{ id: string; label: string }>;
}

export function generateTabsPattern(config: TabsPatternConfig): string {
  const { name, tabs } = config;

  const tabButtons = tabs.map((tab, i) => `
          <button
            key="${tab.id}"
            role="tab"
            id="tab-${tab.id}"
            aria-selected={activeTab === '${tab.id}'}
            aria-controls="panel-${tab.id}"
            tabIndex={activeTab === '${tab.id}' ? 0 : -1}
            onClick={() => setActiveTab('${tab.id}')}
            onKeyDown={(e) => handleKeyDown(e, ${i})}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === '${tab.id}'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            ${tab.label}
          </button>`).join('');

  const tabPanels = tabs.map((tab) => `
        <div
          key="${tab.id}"
          role="tabpanel"
          id="panel-${tab.id}"
          aria-labelledby="tab-${tab.id}"
          hidden={activeTab !== '${tab.id}'}
          className="py-4"
        >
          {/* TODO: Content for ${tab.label} */}
          <p className="text-muted-foreground">Content for ${tab.label}</p>
        </div>`).join('');

  return `'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface ${name}Props {
  className?: string;
  defaultTab?: string;
}

const TABS = ${JSON.stringify(tabs, null, 2)} as const;

export function ${name}({ className, defaultTab = '${tabs[0]?.id}' }: ${name}Props) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = TABS.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    setActiveTab(TABS[newIndex].id);
    document.getElementById(\`tab-\${TABS[newIndex].id}\`)?.focus();
  }, []);

  return (
    <div className={cn('w-full', className)}>
      <div role="tablist" aria-label="${name}" className="flex border-b">
${tabButtons}
      </div>
${tabPanels}
    </div>
  );
}
`;
}
