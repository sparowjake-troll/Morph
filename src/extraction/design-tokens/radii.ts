import type { RadiusToken } from '../../core/types.js';

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>;

export async function extractRadii(page: Page): Promise<RadiusToken[]> {
  const rawRadii = await page.evaluate(() => {
    const radiusMap = new Map<string, { selector: string; count: number }>();
    const elements = document.querySelectorAll('body *');
    const limit = Math.min(elements.length, 300);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      const cs = getComputedStyle(el);
      const radius = cs.borderRadius;

      if (!radius || radius === '0px') continue;

      const existing = radiusMap.get(radius);
      if (existing) {
        existing.count++;
      } else {
        const tag = el.tagName.toLowerCase();
        const cls = el.className?.toString().split(' ')[0] || '';
        radiusMap.set(radius, {
          selector: cls ? `${tag}.${cls}` : tag,
          count: 1,
        });
      }
    }

    return Array.from(radiusMap.entries()).map(([value, meta]) => ({
      value,
      selector: meta.selector,
      count: meta.count,
    }));
  });

  const tailwindRadii: Record<string, string> = {
    'sm': '2px',
    'DEFAULT': '4px',
    'md': '6px',
    'lg': '8px',
    'xl': '12px',
    '2xl': '16px',
    '3xl': '24px',
    'full': '9999px',
  };

  return rawRadii
    .sort((a, b) => b.count - a.count)
    .map((raw) => {
      const px = parseFloat(raw.value);
      const name = findClosestRadiusName(px, tailwindRadii);

      return {
        name: `radius-${name}`,
        value: raw.value,
        category: 'radius' as const,
        source: raw.selector,
        px: isNaN(px) ? 0 : px,
      };
    })
    .filter((token, index, self) =>
      self.findIndex((t) => t.name === token.name) === index
    );
}

function findClosestRadiusName(px: number, scale: Record<string, string>): string {
  if (px >= 9999) return 'full';

  let closest = 'DEFAULT';
  let minDiff = Infinity;

  for (const [name, value] of Object.entries(scale)) {
    const scalePx = parseFloat(value);
    const diff = Math.abs(px - scalePx);
    if (diff < minDiff) {
      minDiff = diff;
      closest = name;
    }
  }

  // If the value doesn't match any standard, use the px value
  if (minDiff > 2) return `${Math.round(px)}`;
  return closest;
}
