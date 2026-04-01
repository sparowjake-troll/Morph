import type { AccessibilityResult } from '../../core/types.js';

export async function runAccessibilityAudit(dir: string): Promise<AccessibilityResult> {
  try {
    const { chromium } = await import('playwright');
    // @ts-expect-error — optional dependency, may not be installed
    const AxeBuilder = (await import('@axe-core/playwright')).default;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Try to connect to local dev server
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10_000 });

    const results = await new AxeBuilder({ page }).analyze();

    await browser.close();

    return {
      violations: results.violations.map((v: { id: string; impact: string; description: string; nodes: unknown[] }) => ({
        id: (v as { id: string }).id,
        impact: ((v as { impact: string }).impact as AccessibilityResult['violations'][0]['impact']) || 'minor',
        description: (v as { description: string }).description,
        nodes: (v as { nodes: unknown[] }).nodes.length,
      })),
      passes: results.passes.length,
      incomplete: results.incomplete.length,
    };
  } catch {
    return { violations: [], passes: 0, incomplete: 0 };
  }
}
