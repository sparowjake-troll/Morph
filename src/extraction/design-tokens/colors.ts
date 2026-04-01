import type { ColorToken } from '../../core/types.js';

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>;

interface RawColor {
  value: string;
  property: string;
  selector: string;
  count: number;
}

export async function extractColors(page: Page): Promise<ColorToken[]> {
  const rawColors = await page.evaluate(() => {
    const colorMap = new Map<string, { property: string; selector: string; count: number }>();

    const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor',
      'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor'] as const;

    const elements = document.querySelectorAll('body *');
    const limit = Math.min(elements.length, 500);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      const cs = getComputedStyle(el);

      for (const prop of colorProps) {
        const value = cs[prop as keyof CSSStyleDeclaration] as string;
        if (!value || value === 'rgba(0, 0, 0, 0)' || value === 'transparent') continue;

        const existing = colorMap.get(value);
        if (existing) {
          existing.count++;
        } else {
          const tag = el.tagName.toLowerCase();
          const cls = el.className?.toString().split(' ')[0] || '';
          colorMap.set(value, {
            property: prop,
            selector: cls ? `${tag}.${cls}` : tag,
            count: 1,
          });
        }
      }
    }

    return Array.from(colorMap.entries()).map(([value, meta]) => ({
      value,
      property: meta.property,
      selector: meta.selector,
      count: meta.count,
    }));
  });

  return deduplicateAndName(rawColors);
}

function deduplicateAndName(rawColors: RawColor[]): ColorToken[] {
  const sorted = rawColors.sort((a, b) => b.count - a.count);
  const tokens: ColorToken[] = [];
  const seen = new Set<string>();

  for (const raw of sorted) {
    const normalized = normalizeColor(raw.value);
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    const usage = classifyUsage(raw.property);
    const name = generateColorName(usage, tokens.filter((t) => t.usage === usage).length);

    tokens.push({
      name,
      value: raw.value,
      category: 'color',
      source: raw.selector,
      usage,
      hex: rgbToHex(raw.value),
      oklch: rgbToOklch(raw.value),
    });
  }

  return tokens;
}

function classifyUsage(property: string): ColorToken['usage'] {
  if (property === 'backgroundColor') return 'background';
  if (property === 'color') return 'foreground';
  if (property.includes('border') || property.includes('outline')) return 'border';
  return 'other';
}

function generateColorName(usage: string, index: number): string {
  const suffix = index === 0 ? '' : `-${index + 1}`;
  return `${usage}${suffix}`;
}

function normalizeColor(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function rgbToHex(rgb: string): string | undefined {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return undefined;
  const [, r, g, b] = match;
  return `#${[r, g, b].map((c) => parseInt(c).toString(16).padStart(2, '0')).join('')}`;
}

function rgbToOklch(rgb: string): ColorToken['oklch'] {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return undefined;

  const [, rs, gs, bs] = match;
  const r = parseInt(rs) / 255;
  const g = parseInt(gs) / 255;
  const b = parseInt(bs) / 255;

  // sRGB to linear
  const toLinear = (c: number): number =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  // Linear RGB to OKLab
  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bVal = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

  // OKLab to OKLCH
  const C = Math.sqrt(a * a + bVal * bVal);
  const H = (Math.atan2(bVal, a) * 180) / Math.PI;

  return {
    l: Math.round(L * 1000) / 1000,
    c: Math.round(C * 1000) / 1000,
    h: Math.round(((H + 360) % 360) * 10) / 10,
  };
}
