import type { MorphConfig } from '../../config/schema.js';
import type { AuditReport } from '../../core/types.js';

export interface AuditOptions {
  originalUrl?: string;
  cloneUrl?: string;
  lighthouseOnly?: boolean;
  a11yOnly?: boolean;
  visualOnly?: boolean;
}

export async function runAudit(
  dir: string,
  config: MorphConfig,
  options?: AuditOptions
): Promise<AuditReport> {
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
  };

  const runAll = !options?.lighthouseOnly && !options?.a11yOnly && !options?.visualOnly;

  // Lighthouse
  if ((runAll || options?.lighthouseOnly) && config.audit.lighthouse) {
    try {
      const { runLighthouseAudit } = await import('./lighthouse.js');
      report.lighthouse = await runLighthouseAudit(dir);
    } catch {
      // Lighthouse not installed — skip
    }
  }

  // Accessibility
  if ((runAll || options?.a11yOnly) && config.audit.accessibility) {
    try {
      const { runAccessibilityAudit } = await import('./accessibility.js');
      report.accessibility = await runAccessibilityAudit(dir);
    } catch {
      // axe-core not installed — skip
    }
  }

  // Unused CSS
  if (runAll && config.audit.unusedCss) {
    try {
      const { detectUnusedCss } = await import('./unused-css.js');
      report.unusedCss = await detectUnusedCss(dir);
    } catch {
      // Skip
    }
  }

  // Bundle size
  if (runAll && config.audit.bundleSize) {
    try {
      const { analyzeBundleSize } = await import('./bundle-size.js');
      report.bundleSize = await analyzeBundleSize(dir);
    } catch {
      // Skip
    }
  }

  // Broken links
  if (runAll && config.audit.brokenLinks) {
    try {
      const { checkBrokenLinks } = await import('./broken-links.js');
      report.brokenLinks = await checkBrokenLinks(dir);
    } catch {
      // Skip
    }
  }

  // Visual regression
  if ((runAll || options?.visualOnly) && config.audit.visualRegression.enabled) {
    if (options?.originalUrl && options?.cloneUrl) {
      try {
        const { runVisualRegression } = await import('../visual-regression/runner.js');
        report.visualRegression = await runVisualRegression(
          options.originalUrl,
          options.cloneUrl,
          config
        );
      } catch {
        // Playwright not installed — skip
      }
    }
  }

  return report;
}
