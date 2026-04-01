import type { ShadowToken } from '../../core/types.js';

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>;

export async function extractShadows(page: Page): Promise<ShadowToken[]> {
  const rawShadows = await page.evaluate(() => {
    const shadowMap = new Map<string, { selector: string; count: number }>();
    const elements = document.querySelectorAll('body *');
    const limit = Math.min(elements.length, 300);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      const cs = getComputedStyle(el);
      const shadow = cs.boxShadow;

      if (!shadow || shadow === 'none') continue;

      const existing = shadowMap.get(shadow);
      if (existing) {
        existing.count++;
      } else {
        const tag = el.tagName.toLowerCase();
        const cls = el.className?.toString().split(' ')[0] || '';
        shadowMap.set(shadow, {
          selector: cls ? `${tag}.${cls}` : tag,
          count: 1,
        });
      }
    }

    return Array.from(shadowMap.entries()).map(([value, meta]) => ({
      value,
      selector: meta.selector,
      count: meta.count,
    }));
  });

  return rawShadows
    .sort((a, b) => b.count - a.count)
    .map((raw, index) => {
      const name = index === 0 ? 'shadow' : `shadow-${index + 1}`;
      return {
        name,
        value: raw.value,
        category: 'shadow' as const,
        source: raw.selector,
        parsed: parseShadow(raw.value),
      };
    });
}

function parseShadow(value: string): ShadowToken['parsed'] {
  const inset = value.includes('inset');
  const cleaned = value.replace('inset', '').trim();

  // Match: offsetX offsetY blur spread color
  const match = cleaned.match(
    /(-?\d+(?:\.\d+)?px)\s+(-?\d+(?:\.\d+)?px)\s+(-?\d+(?:\.\d+)?px)\s*(-?\d+(?:\.\d+)?px)?\s+(.*)/
  );

  if (!match) return undefined;

  return {
    offsetX: match[1],
    offsetY: match[2],
    blur: match[3],
    spread: match[4] || '0px',
    color: match[5].trim(),
    inset,
  };
}
