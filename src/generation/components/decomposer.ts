import type { ComponentTree, ComponentNode, InteractionMap } from '../../core/types.js';

export function decomposeDOM(html: string, interactions: InteractionMap): ComponentTree {
  const { load } = require('cheerio');
  const $ = load(html);

  const body = $('body');
  const root = walkElement($, body, interactions, 0);

  const allNodes = flattenTree(root);
  const clientCount = allNodes.filter((n) => n.isClient).length;

  return {
    root,
    totalComponents: allNodes.length,
    clientComponents: clientCount,
    serverComponents: allNodes.length - clientCount,
  };
}

function walkElement(
  $: ReturnType<typeof import('cheerio').load>,
  el: ReturnType<ReturnType<typeof import('cheerio').load>>,
  interactions: InteractionMap,
  depth: number
): ComponentNode {
  const tagName = (el.prop('tagName') || 'div') as string;
  const className = el.attr('class') || '';
  const isSection = isSectionElement(tagName.toLowerCase(), className, depth);

  // Determine if this should be a component
  const name = generateComponentName(tagName, className, depth);
  const isClient = isClientComponent(el, interactions);

  const children: ComponentNode[] = [];

  if (isSection && depth < 4) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    el.children().each((_: number, child: any) => {
      const $child = $(child);
      if ($child.prop('tagName')) {
        const childNode = walkElement($, $child, interactions, depth + 1);
        if (childNode.name !== 'Unknown') {
          children.push(childNode);
        }
      }
    });
  }

  return {
    name,
    filePath: `src/components/${name}.tsx`,
    isClient,
    reason: isClient ? 'Contains interactive elements' : undefined,
    props: [],
    children,
    html: el.html()?.slice(0, 500),
  };
}

function isSectionElement(tag: string, className: string, depth: number): boolean {
  const sectionTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
  if (sectionTags.includes(tag)) return true;
  if (depth === 0 && tag === 'div') return true;
  if (className.match(/section|container|wrapper|hero|banner|cta|feature|pricing|testimonial|footer|header|nav/i)) {
    return true;
  }
  return false;
}

function generateComponentName(tag: string, className: string, _depth: number): string {
  // Try to infer from class name
  const meaningfulClasses = className.split(/\s+/).filter((cls) =>
    cls.match(/^[a-zA-Z]/) && !cls.match(/^(flex|grid|block|hidden|relative|absolute|p-|m-|w-|h-|text-|bg-|border-)/)
  );

  if (meaningfulClasses.length > 0) {
    return toPascalCase(meaningfulClasses[0]);
  }

  const tagMap: Record<string, string> = {
    header: 'Header',
    nav: 'Navigation',
    main: 'MainContent',
    section: 'Section',
    article: 'Article',
    aside: 'Sidebar',
    footer: 'Footer',
  };

  return tagMap[tag.toLowerCase()] || 'Unknown';
}

function isClientComponent(
  el: ReturnType<ReturnType<typeof import('cheerio').load>>,
  interactions: InteractionMap
): boolean {
  const html = el.html() || '';

  // Check if this element contains any interactive patterns
  const interactiveSelectors = Object.values(interactions).flat();
  for (const item of interactiveSelectors) {
    if (html.includes(item.selector.split('.')[1] || '')) {
      return true;
    }
  }

  // Check for form elements
  if (el.find('form, input, select, textarea, button[type="submit"]').length > 0) {
    return true;
  }

  // Check for interactive attributes
  if (el.find('[onclick], [onchange], [onsubmit], [role="button"], [role="dialog"], [role="tablist"]').length > 0) {
    return true;
  }

  return false;
}

function flattenTree(node: ComponentNode): ComponentNode[] {
  const result = [node];
  for (const child of node.children) {
    result.push(...flattenTree(child));
  }
  return result;
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
