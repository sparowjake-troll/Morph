import type { TypographyToken } from '../../core/types.js';

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>;

interface RawTypography {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  selector: string;
  tag: string;
  count: number;
}

export async function extractTypography(page: Page): Promise<TypographyToken[]> {
  const rawTypo = await page.evaluate(() => {
    const typoMap = new Map<string, RawTypography>();
    const elements = document.querySelectorAll('body *');
    const limit = Math.min(elements.length, 500);

    for (let i = 0; i < limit; i++) {
      const el = elements[i] as HTMLElement;
      if (!el.textContent?.trim()) continue;

      const cs = getComputedStyle(el);
      const key = `${cs.fontFamily}|${cs.fontSize}|${cs.fontWeight}|${cs.lineHeight}`;

      const existing = typoMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        const tag = el.tagName.toLowerCase();
        const cls = el.className?.toString().split(' ')[0] || '';
        typoMap.set(key, {
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          selector: cls ? `${tag}.${cls}` : tag,
          tag,
          count: 1,
        });
      }
    }

    return Array.from(typoMap.values());
  });

  return processTypography(rawTypo);
}

function processTypography(raw: RawTypography[]): TypographyToken[] {
  const tokens: TypographyToken[] = [];

  // Extract unique font families
  const families = new Set<string>();
  for (const t of raw) {
    const family = t.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
    families.add(family);
  }

  for (const family of families) {
    tokens.push({
      name: `font-${sanitizeName(family)}`,
      value: family,
      category: 'typography',
      source: raw.find((t) => t.fontFamily.includes(family))?.selector ?? '',
      fontFamily: family,
    });
  }

  // Extract unique font size scale
  const sizes = new Map<string, RawTypography>();
  for (const t of raw) {
    if (!sizes.has(t.fontSize) || (sizes.get(t.fontSize)?.count ?? 0) < t.count) {
      sizes.set(t.fontSize, t);
    }
  }

  const sortedSizes = Array.from(sizes.entries()).sort(
    (a, b) => parseFloat(b[0]) - parseFloat(a[0])
  );

  const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  for (const [fontSize, meta] of sortedSizes) {
    const headingIndex = headingTags.indexOf(meta.tag);
    const name = headingIndex >= 0 ? headingTags[headingIndex] : `text-${fontSize.replace('px', '')}`;

    tokens.push({
      name,
      value: fontSize,
      category: 'typography',
      source: meta.selector,
      fontSize,
      fontWeight: meta.fontWeight,
      lineHeight: meta.lineHeight,
      letterSpacing: meta.letterSpacing !== 'normal' ? meta.letterSpacing : undefined,
    });
  }

  return tokens;
}

function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}
