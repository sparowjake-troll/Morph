import { Command } from 'commander';
import { log } from '../utils/logger.js';
import { withSpinner } from '../utils/progress.js';
import { resolveConfig } from '../utils/resolve-config.js';
import type { AuditReport } from '../../core/types.js';

export interface AuditOptions {
  config?: string;
  originalUrl?: string;
  cloneUrl?: string;
  lighthouseOnly?: boolean;
  a11yOnly?: boolean;
  visualOnly?: boolean;
}

export async function runAuditCommand(dir: string, options: AuditOptions): Promise<AuditReport> {
  const config = await resolveConfig(options.config);

  log.heading('Morph Audit');
  log.table({ 'Directory': dir });
  log.divider();

  const report = await withSpinner(
    'Running quality audit',
    async () => {
      const { runAudit } = await import('../../quality/audit/runner.js');
      return runAudit(dir, config, {
        originalUrl: options.originalUrl,
        cloneUrl: options.cloneUrl,
        lighthouseOnly: options.lighthouseOnly,
        a11yOnly: options.a11yOnly,
        visualOnly: options.visualOnly,
      });
    }
  );

  log.divider();
  log.heading('Audit Results');

  if (report.lighthouse) {
    log.info('Lighthouse Scores:');
    log.table({
      'Performance': `${report.lighthouse.performance}/100`,
      'Accessibility': `${report.lighthouse.accessibility}/100`,
      'Best Practices': `${report.lighthouse.bestPractices}/100`,
      'SEO': `${report.lighthouse.seo}/100`,
    });
  }

  if (report.accessibility) {
    const { violations, passes } = report.accessibility;
    const critical = violations.filter((v) => v.impact === 'critical').length;
    const serious = violations.filter((v) => v.impact === 'serious').length;
    log.info(`Accessibility: ${passes} passes, ${violations.length} violations (${critical} critical, ${serious} serious)`);
  }

  if (report.bundleSize) {
    log.info('Bundle Size:');
    log.table({
      'Total': formatBytes(report.bundleSize.totalSize),
      'JavaScript': formatBytes(report.bundleSize.jsSize),
      'CSS': formatBytes(report.bundleSize.cssSize),
      'Images': formatBytes(report.bundleSize.imageSize),
    });
  }

  if (report.brokenLinks) {
    const { broken, total } = report.brokenLinks;
    if (broken.length > 0) {
      log.warn(`Broken links: ${broken.length}/${total}`);
      for (const link of broken.slice(0, 5)) {
        log.dim(`  ${link.status} ${link.url}`);
      }
    } else {
      log.success(`All ${total} links valid`);
    }
  }

  if (report.visualRegression) {
    const { overallPassed, viewports } = report.visualRegression;
    if (overallPassed) {
      log.success('Visual regression: PASSED');
    } else {
      log.warn('Visual regression: FAILED');
      for (const vp of viewports) {
        log.dim(`  ${vp.name} (${vp.width}px): ${(vp.diffPercent * 100).toFixed(1)}% diff`);
      }
    }
  }

  return report;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export const auditCommand = new Command('audit')
  .description('Run quality audit on a clone (Lighthouse, a11y, visual regression)')
  .argument('[dir]', 'Directory to audit', '.')
  .option('-c, --config <path>', 'Path to morph.config.ts')
  .option('--original-url <url>', 'Original site URL for visual regression')
  .option('--clone-url <url>', 'Local clone URL for visual regression')
  .option('--lighthouse-only', 'Run only Lighthouse audit')
  .option('--a11y-only', 'Run only accessibility audit')
  .option('--visual-only', 'Run only visual regression')
  .action(async (dir: string, options: AuditOptions) => {
    try {
      await runAuditCommand(dir, options);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
