import type { ComponentTree, ComponentNode } from '../core/types.js';

interface FigmaComponentInfo {
  key: string;
  name: string;
  description?: string;
  containingFrame?: { name: string };
}

export function mapFigmaComponentsToTree(components: FigmaComponentInfo[]): ComponentTree {
  // Group components by containing frame
  const groups = new Map<string, FigmaComponentInfo[]>();

  for (const comp of components) {
    const group = comp.containingFrame?.name || 'root';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(comp);
  }

  // Build tree
  const children: ComponentNode[] = [];

  for (const [groupName, groupComps] of groups) {
    const groupChildren = groupComps.map((comp) => figmaToComponentNode(comp));

    if (groupName === 'root') {
      children.push(...groupChildren);
    } else {
      children.push({
        name: toPascalCase(groupName),
        filePath: `src/components/${toPascalCase(groupName)}.tsx`,
        isClient: false,
        props: [],
        children: groupChildren,
      });
    }
  }

  const root: ComponentNode = {
    name: 'App',
    filePath: 'src/app/page.tsx',
    isClient: false,
    props: [],
    children,
  };

  const allNodes = flattenTree(root);

  return {
    root,
    totalComponents: allNodes.length,
    clientComponents: allNodes.filter((n) => n.isClient).length,
    serverComponents: allNodes.filter((n) => !n.isClient).length,
  };
}

function figmaToComponentNode(comp: FigmaComponentInfo): ComponentNode {
  const name = toPascalCase(comp.name);

  // Infer if it's a client component based on name
  const interactivePatterns = /button|input|form|modal|dialog|dropdown|menu|tab|carousel|slider|toggle|switch/i;
  const isClient = interactivePatterns.test(comp.name);

  return {
    name,
    filePath: `src/components/${name}.tsx`,
    isClient,
    reason: isClient ? `Interactive component: ${comp.name}` : undefined,
    props: comp.description
      ? [{ name: 'children', type: 'React.ReactNode', required: false }]
      : [],
    children: [],
  };
}

function flattenTree(node: ComponentNode): ComponentNode[] {
  return [node, ...node.children.flatMap(flattenTree)];
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s/]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
