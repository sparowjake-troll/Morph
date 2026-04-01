import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { ComponentTree, ComponentNode, GeneratedFile } from '../../core/types.js';

export async function generateComponentStubs(
  tree: ComponentTree,
  outputDir: string
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];
  const nodes = flattenTree(tree.root);

  // Filter out generic/unknown nodes
  const meaningfulNodes = nodes.filter((n) =>
    n.name !== 'Unknown' && n.name !== 'MainContent'
  );

  for (const node of meaningfulNodes) {
    const content = generateStub(node);
    const filePath = join(outputDir, node.filePath);
    files.push({ path: filePath, content, type: 'component' });
  }

  // Write all files
  for (const file of files) {
    await mkdir(dirname(file.path), { recursive: true });
    await writeFile(file.path, file.content);
  }

  return files;
}

function generateStub(node: ComponentNode): string {
  const lines: string[] = [];

  if (node.isClient) {
    lines.push("'use client';");
    lines.push('');
  }

  // Imports
  lines.push("import { cn } from '@/lib/utils';");
  if (node.children.length > 0) {
    for (const child of node.children) {
      if (child.name !== 'Unknown') {
        lines.push(`import { ${child.name} } from '@/components/${child.name}';`);
      }
    }
  }
  lines.push('');

  // Props interface
  const propsName = `${node.name}Props`;
  lines.push(`export interface ${propsName} {`);
  lines.push('  className?: string;');
  for (const prop of node.props) {
    const optional = prop.required ? '' : '?';
    lines.push(`  ${prop.name}${optional}: ${prop.type};`);
  }
  lines.push('}');
  lines.push('');

  // Component
  lines.push(`export function ${node.name}({ className${node.props.length > 0 ? ', ...props' : ''} }: ${propsName}) {`);

  if (node.isClient && hasInteractiveElements(node)) {
    lines.push("  // TODO: Add state management for interactive elements");
    lines.push('');
  }

  lines.push('  return (');
  lines.push(`    <section className={cn('', className)}>`);

  if (node.children.length > 0) {
    for (const child of node.children) {
      if (child.name !== 'Unknown') {
        lines.push(`      <${child.name} />`);
      }
    }
  } else {
    lines.push(`      {/* TODO: Implement ${node.name} content */}`);
  }

  lines.push('    </section>');
  lines.push('  );');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

function hasInteractiveElements(node: ComponentNode): boolean {
  return node.isClient && (
    node.reason?.includes('form') ||
    node.reason?.includes('interactive') ||
    node.reason?.includes('event') ||
    false
  );
}

function flattenTree(node: ComponentNode): ComponentNode[] {
  const result = [node];
  for (const child of node.children) {
    result.push(...flattenTree(child));
  }
  return result;
}
