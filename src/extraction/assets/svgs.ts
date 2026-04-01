import { readFile, writeFile, stat } from 'node:fs/promises';

interface SvgResult {
  path: string;
  size: number;
  originalSize: number;
}

export async function optimizeSvg(filePath: string): Promise<SvgResult> {
  try {
    const { optimize } = await import('svgo');
    const original = await readFile(filePath, 'utf-8');
    const originalSize = Buffer.byteLength(original);

    const result = optimize(original, {
      multipass: true,
      plugins: [
        'preset-default',
        'removeDimensions',
        {
          name: 'removeAttrs',
          params: { attrs: '(data-.*)' },
        },
      ],
    });

    await writeFile(filePath, result.data);
    const s = await stat(filePath);

    return { path: filePath, size: s.size, originalSize };
  } catch {
    const s = await stat(filePath);
    return { path: filePath, size: s.size, originalSize: s.size };
  }
}

export async function extractInlineSvgs(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>
): Promise<Array<{ name: string; svg: string }>> {
  return page.evaluate(() => {
    const svgs = document.querySelectorAll('svg');
    const results: Array<{ name: string; svg: string }> = [];
    const seen = new Set<string>();

    svgs.forEach((svg, index) => {
      const outer = svg.outerHTML;
      const simplified = outer.replace(/\s+/g, ' ').trim();
      if (seen.has(simplified)) return;
      seen.add(simplified);

      // Try to infer a name from context
      const parent = svg.parentElement;
      const ariaLabel = svg.getAttribute('aria-label');
      const title = svg.querySelector('title')?.textContent;
      const parentClass = parent?.className?.toString().split(' ')[0];

      const name = ariaLabel || title || parentClass || `icon-${index}`;
      const safeName = name
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();

      results.push({ name: safeName || `icon-${index}`, svg: outer });
    });

    return results;
  });
}
