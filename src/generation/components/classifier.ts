import type { ComponentNode } from '../../core/types.js';

interface ClassificationRule {
  name: string;
  test: (node: ComponentNode) => boolean;
  result: 'client' | 'server';
  reason: string;
}

const RULES: ClassificationRule[] = [
  {
    name: 'has-event-handlers',
    test: (node) => {
      const html = node.html || '';
      return /on(click|change|submit|focus|blur|hover|scroll|keydown|keyup|mouseenter|mouseleave)/i.test(html);
    },
    result: 'client',
    reason: 'Contains DOM event handlers',
  },
  {
    name: 'has-form-elements',
    test: (node) => {
      const html = node.html || '';
      return /<(form|input|select|textarea)\b/i.test(html);
    },
    result: 'client',
    reason: 'Contains form elements requiring client-side handling',
  },
  {
    name: 'has-interactive-roles',
    test: (node) => {
      const html = node.html || '';
      return /role="(dialog|tablist|menu|menubar|listbox|combobox|slider|spinbutton)"/i.test(html);
    },
    result: 'client',
    reason: 'Contains ARIA roles requiring client-side interaction',
  },
  {
    name: 'has-animation-classes',
    test: (node) => {
      const html = node.html || '';
      return /class="[^"]*\b(animate-|motion-|transition-|carousel|slider|swiper|accordion)/i.test(html);
    },
    result: 'client',
    reason: 'Contains animation or transition classes',
  },
  {
    name: 'has-video-or-canvas',
    test: (node) => {
      const html = node.html || '';
      return /<(video|canvas|audio)\b/i.test(html);
    },
    result: 'client',
    reason: 'Contains media elements requiring client-side control',
  },
  {
    name: 'is-navigation-with-dropdown',
    test: (node) => {
      const html = node.html || '';
      return node.name.toLowerCase().includes('nav')
        && (html.includes('dropdown') || html.includes('submenu'));
    },
    result: 'client',
    reason: 'Navigation with dropdown menus',
  },
];

export function classifyComponentTree(root: ComponentNode): ComponentNode {
  return classifyNode(root);
}

function classifyNode(node: ComponentNode): ComponentNode {
  // Classify children first
  const classifiedChildren = node.children.map(classifyNode);

  // Check if any child is a client component
  const hasClientChild = classifiedChildren.some((c) => c.isClient);

  // Run classification rules
  let isClient = node.isClient;
  let reason = node.reason;

  for (const rule of RULES) {
    if (rule.test(node)) {
      isClient = rule.result === 'client';
      reason = rule.reason;
      break;
    }
  }

  // If children are client but parent is server, parent stays server
  // (children can be islands within a server component)

  return {
    ...node,
    isClient,
    reason,
    children: classifiedChildren,
  };
}
