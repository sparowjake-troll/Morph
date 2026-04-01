import type { LighthouseResult } from '../../core/types.js';

export async function runLighthouseAudit(dir: string): Promise<LighthouseResult> {
  // Try to use Lighthouse programmatically
  try {
    // @ts-expect-error — optional dependency, may not be installed
    const lighthouse = await import('lighthouse');
    const { chromium } = await import('playwright');

    const browser = await chromium.launch({ headless: true });
    const port = new URL(browser.contexts()[0]?.pages()[0]?.url() || 'http://localhost').port;

    const result = await lighthouse.default(`http://localhost:3000`, {
      port: parseInt(port || '9222'),
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });

    await browser.close();

    if (result?.lhr) {
      return {
        performance: Math.round((result.lhr.categories.performance?.score ?? 0) * 100),
        accessibility: Math.round((result.lhr.categories.accessibility?.score ?? 0) * 100),
        bestPractices: Math.round((result.lhr.categories['best-practices']?.score ?? 0) * 100),
        seo: Math.round((result.lhr.categories.seo?.score ?? 0) * 100),
      };
    }
  } catch {
    // Lighthouse failed — return zeroes
  }

  return { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 };
}
