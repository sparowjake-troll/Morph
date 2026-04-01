import type { InteractionMap, InteractiveElement } from '../../core/types.js';
import { INTERACTIVE_SELECTORS } from '../../core/constants.js';
import { classifyComponent } from './classifier.js';

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>;

export async function detectInteractions(page: Page): Promise<InteractionMap> {
  const rawElements = await page.evaluate((selectors) => {
    const results: Record<string, Array<{ selector: string; tag: string; classes: string; text: string; childCount: number; hasEventListeners: boolean }>> = {};

    for (const [type, selectorList] of Object.entries(selectors)) {
      results[type] = [];
      for (const sel of selectorList) {
        const elements = document.querySelectorAll(sel);
        elements.forEach((el) => {
          const tag = el.tagName.toLowerCase();
          const classes = el.className?.toString() || '';
          const text = el.textContent?.trim().slice(0, 100) || '';

          results[type].push({
            selector: classes ? `${tag}.${classes.split(' ')[0]}` : tag,
            tag,
            classes,
            text,
            childCount: el.children.length,
            hasEventListeners: typeof (el as HTMLElement).onclick === 'function',
          });
        });
      }
    }

    return results;
  }, INTERACTIVE_SELECTORS as unknown as Record<string, string[]>);

  const map: InteractionMap = {
    forms: [],
    modals: [],
    carousels: [],
    tabs: [],
    dropdowns: [],
    accordions: [],
    tooltips: [],
    menus: [],
  };

  for (const [type, elements] of Object.entries(rawElements)) {
    const key = type as keyof InteractionMap;
    if (!(key in map)) continue;

    map[key] = elements.map((el) => {
      const element: InteractiveElement = {
        selector: el.selector,
        type: key.slice(0, -1) as InteractiveElement['type'], // remove plural 's'
        componentType: 'client',
        reason: '',
      };

      const classification = classifyComponent(element, el.hasEventListeners, el.childCount);
      element.componentType = classification.type;
      element.reason = classification.reason;

      return element;
    });
  }

  return map;
}
