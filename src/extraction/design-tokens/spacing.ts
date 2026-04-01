import type { SpacingToken } from '../../core/types.js';

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>;

export async function extractSpacing(page: Page): Promise<SpacingToken[]> {
  const rawValues = await page.evaluate(() => {
    const spacingMap = new Map<number, { count: number; selector: string; property: string }>();
    const spacingProps = [
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
      'gap', 'rowGap', 'columnGap',
    ] as const;

    const elements = document.querySelectorAll('body *');
    const limit = Math.min(elements.length, 300);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      const cs = getComputedStyle(el);

      for (const prop of spacingProps) {
        const value = cs[prop as keyof CSSStyleDeclaration] as string;
        if (!value || value === '0px' || value === 'auto' || value === 'normal') continue;

        const px = parseFloat(value);
        if (isNaN(px) || px <= 0 || px > 500) continue;

        const rounded = Math.round(px);
        const existing = spacingMap.get(rounded);
        if (existing) {
          existing.count++;
        } else {
          const tag = el.tagName.toLowerCase();
          const cls = el.className?.toString().split(' ')[0] || '';
          spacingMap.set(rounded, {
            count: 1,
            selector: cls ? `${tag}.${cls}` : tag,
            property: prop,
          });
        }
      }
    }

    return Array.from(spacingMap.entries()).map(([px, meta]) => ({
      px,
      count: meta.count,
      selector: meta.selector,
      property: meta.property,
    }));
  });

  return buildSpacingScale(rawValues);
}

interface RawSpacing {
  px: number;
  count: number;
  selector: string;
  property: string;
}

function buildSpacingScale(raw: RawSpacing[]): SpacingToken[] {
  // Cluster values that are within 2px of each other
  const clusters = clusterValues(raw.map((r) => r.px));

  // Filter to commonly used values (count >= 2 or standard Tailwind values)
  const tailwindScale = [0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96];

  const tokens: SpacingToken[] = [];
  const usedValues = new Set<number>();

  for (const cluster of clusters) {
    const nearestTailwind = findNearest(cluster, tailwindScale);
    const value = Math.abs(cluster - nearestTailwind) <= 2 ? nearestTailwind : cluster;

    if (usedValues.has(value)) continue;
    usedValues.add(value);

    const source = raw.find((r) => Math.abs(r.px - cluster) <= 2);

    tokens.push({
      name: `spacing-${value}`,
      value: `${value}px`,
      category: 'spacing',
      source: source?.selector ?? '',
      px: value,
      rem: Math.round((value / 16) * 1000) / 1000,
    });
  }

  return tokens.sort((a, b) => a.px - b.px);
}

function clusterValues(values: number[]): number[] {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  const clusters: number[] = [];
  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - current <= 2) {
      current = Math.round((current + sorted[i]) / 2);
    } else {
      clusters.push(current);
      current = sorted[i];
    }
  }
  if (current !== undefined) clusters.push(current);

  return clusters;
}

function findNearest(value: number, scale: number[]): number {
  let nearest = scale[0];
  let minDiff = Math.abs(value - nearest);

  for (const s of scale) {
    const diff = Math.abs(value - s);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = s;
    }
  }

  return nearest;
}
