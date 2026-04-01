import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { MorphConfig } from '../../config/schema.js';
import type { VisualRegressionResult } from '../../core/types.js';
import { PATHS } from '../../core/constants.js';
import { compareScreenshots } from './comparator.js';
import { generateVisualReport } from './report.js';

export async function runVisualRegression(
  originalUrl: string,
  cloneUrl: string,
  config: MorphConfig
): Promise<VisualRegressionResult> {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });

  const threshold = config.audit.visualRegression.threshold;
  const viewportNames = config.audit.visualRegression.viewports;
  const viewports = config.extraction.viewports.filter((v) =>
    viewportNames.includes(v.name)
  );

  const results: VisualRegressionResult['viewports'] = [];

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });

      // Screenshot original
      const originalPage = await context.newPage();
      await originalPage.goto(originalUrl, { waitUntil: 'networkidle', timeout: 30_000 });
      const originalScreenshot = await originalPage.screenshot({ fullPage: true, type: 'png' });

      // Screenshot clone
      const clonePage = await context.newPage();
      await clonePage.goto(cloneUrl, { waitUntil: 'networkidle', timeout: 30_000 });
      const cloneScreenshot = await clonePage.screenshot({ fullPage: true, type: 'png' });

      // Compare
      const comparison = await compareScreenshots(
        Buffer.from(originalScreenshot),
        Buffer.from(cloneScreenshot),
        threshold
      );

      // Save screenshots
      const outputDir = PATHS.designReferences;
      await mkdir(outputDir, { recursive: true });

      const originalPath = join(outputDir, `vr-${viewport.name}-original.png`);
      const clonePath = join(outputDir, `vr-${viewport.name}-clone.png`);
      const diffPath = join(outputDir, `vr-${viewport.name}-diff.png`);

      await writeFile(originalPath, originalScreenshot);
      await writeFile(clonePath, cloneScreenshot);
      await writeFile(diffPath, comparison.diffImage);

      results.push({
        name: viewport.name,
        width: viewport.width,
        diffPercent: comparison.diffPercent,
        diffPixels: comparison.diffPixels,
        passed: comparison.diffPercent <= threshold,
        originalScreenshot: originalPath,
        cloneScreenshot: clonePath,
        diffScreenshot: diffPath,
      });

      await context.close();
    }
  } finally {
    await browser.close();
  }

  const result: VisualRegressionResult = {
    viewports: results,
    overallPassed: results.every((r) => r.passed),
  };

  // Generate HTML report
  const report = generateVisualReport(result);
  await mkdir(PATHS.morphCache, { recursive: true });
  await writeFile(PATHS.auditReport, report);

  return result;
}
