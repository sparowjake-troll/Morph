import type { ChangedSection, GeneratedFile } from '../core/types.js';
import type { MorphConfig } from '../config/schema.js';

export async function regenerateChanged(
  changes: ChangedSection[],
  _config: MorphConfig,
  outputDir: string
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  const added = changes.filter((c) => c.type === 'added');
  const modified = changes.filter((c) => c.type === 'modified');
  const removed = changes.filter((c) => c.type === 'removed');

  // Log what's happening
  if (added.length > 0) {
    console.log(`New sections detected: ${added.map((c) => c.name).join(', ')}`);
  }
  if (modified.length > 0) {
    console.log(`Modified sections: ${modified.map((c) => c.name).join(', ')}`);
  }
  if (removed.length > 0) {
    console.log(`Removed sections: ${removed.map((c) => c.name).join(', ')}`);
  }

  // Generate stubs for new and modified sections
  for (const change of [...added, ...modified] as Array<ChangedSection & { type: 'added' | 'modified' }>) {
    if (change.componentPath) {
      const componentName = change.name.split('/').pop()?.replace('.tsx', '') || 'Component';
      files.push({
        path: `${outputDir}/${change.componentPath}`,
        content: generateRegeneratedStub(componentName, change.type),
        type: 'component',
      });
    }
  }

  return files;
}

function generateRegeneratedStub(name: string, changeType: 'added' | 'modified'): string {
  const comment = changeType === 'added'
    ? '// NEW: This component was added to the target site'
    : '// UPDATED: This component changed on the target site — regenerate from spec';

  return `${comment}
import { cn } from '@/lib/utils';

export interface ${name}Props {
  className?: string;
}

export function ${name}({ className }: ${name}Props) {
  return (
    <section className={cn('', className)}>
      {/* TODO: Regenerate from updated spec */}
    </section>
  );
}
`;
}
