import type { InteractiveElement } from '../../core/types.js';

interface ClassificationResult {
  type: 'server' | 'client';
  reason: string;
}

const CLIENT_TYPES = new Set<InteractiveElement['type']>([
  'form', 'modal', 'carousel', 'tabs', 'dropdown', 'accordion', 'tooltip', 'menu',
]);

const STATIC_THRESHOLD = 0;

export function classifyComponent(
  element: InteractiveElement,
  hasEventListeners: boolean,
  childCount: number
): ClassificationResult {
  // Forms always need client-side handling
  if (element.type === 'form') {
    return { type: 'client', reason: 'Forms require client-side validation and submission' };
  }

  // Modals require focus trapping and portal rendering
  if (element.type === 'modal') {
    return { type: 'client', reason: 'Modals require focus trapping and portal rendering' };
  }

  // Carousels require scroll/swipe handling
  if (element.type === 'carousel') {
    return { type: 'client', reason: 'Carousels require client-side scroll/swipe handling' };
  }

  // Tabs require state management
  if (element.type === 'tabs') {
    return { type: 'client', reason: 'Tabs require client-side state for active tab' };
  }

  // Dropdowns require toggle state
  if (element.type === 'dropdown') {
    return { type: 'client', reason: 'Dropdowns require client-side toggle state' };
  }

  // Accordions can be server-rendered with <details> but usually need client state
  if (element.type === 'accordion') {
    return { type: 'client', reason: 'Accordions need client-side expand/collapse state' };
  }

  // Tooltips require hover/focus handling
  if (element.type === 'tooltip') {
    return { type: 'client', reason: 'Tooltips require hover/focus event handling' };
  }

  // Menus with many children likely have dropdowns
  if (element.type === 'menu' && childCount > STATIC_THRESHOLD) {
    return hasEventListeners
      ? { type: 'client', reason: 'Navigation menu with interactive elements' }
      : { type: 'server', reason: 'Static navigation menu' };
  }

  // Default: interactive types are client components
  if (CLIENT_TYPES.has(element.type)) {
    return { type: 'client', reason: `${element.type} elements are interactive by nature` };
  }

  return { type: 'server', reason: 'No interactive behavior detected' };
}
