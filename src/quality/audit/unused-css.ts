import type { UnusedCssResult } from '../../core/types.js';

export async function detectUnusedCss(dir: string): Promise<UnusedCssResult> {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10_000 });

    // Use Chrome's Coverage API
    await page.coverage.startCSSCoverage();
    await page.reload({ waitUntil: 'networkidle' });
    const coverage = await page.coverage.stopCSSCoverage();

    let totalBytes = 0;
    let unusedBytes = 0;
    const unusedDetails: Array<{ selector: string; file: string }> = [];

    for (const entry of coverage) {
      const total = entry.text?.length ?? 0;
      const used = entry.ranges.reduce((sum, range) => sum + (range.end - range.start), 0);
      totalBytes += total;
      unusedBytes += total - used;
    }

    await browser.close();

    return {
      totalRules: coverage.length,
      unusedRules: 0, // Simplified — full implementation would parse CSS rules
      unusedBytes,
      details: unusedDetails,
    };
  } catch {
    return { totalRules: 0, unusedRules: 0, unusedBytes: 0, details: [] };
  }
}
