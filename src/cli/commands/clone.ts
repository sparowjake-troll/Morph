import { Command } from 'commander';
import { log } from '../utils/logger.js';
import { withSpinner } from '../utils/progress.js';
import { resolveConfig } from '../utils/resolve-config.js';
import type { MorphConfig } from '../../config/schema.js';
import type { CloneResult } from '../../core/types.js';

export interface CloneOptions {
  config?: string;
  output?: string;
  framework?: string;
  depth?: string;
  skipAudit?: boolean;
  skipAssets?: boolean;
  viewports?: string;
  incremental?: boolean;
}

export async function runClone(urls: string[], options: CloneOptions): Promise<CloneResult> {
  const config = await resolveConfig(options.config);

  if (options.output) config.output.directory = options.output;
  if (options.framework) {
    config.output.framework = options.framework as MorphConfig['output']['framework'];
  }
  if (options.depth) config.extraction.maxDepth = parseInt(options.depth, 10);

  const startTime = Date.now();

  log.heading('Morph — AI Website Cloner');
  log.table({
    'URLs': urls.join(', '),
    'Framework': config.output.framework,
    'Output': config.output.directory,
    'Viewports': config.extraction.viewports.map((v) => v.name).join(', '),
  });
  log.divider();

  // Phase 1: Extract design tokens
  const tokens = await withSpinner(
    'Extracting design tokens',
    async () => {
      const { extractDesignTokens } = await import('../../extraction/design-tokens/extractor.js');
      const { BrowserManager } = await import('../../extraction/browser.js');
      const browser = new BrowserManager();
      try {
        await browser.launch();
        const page = await browser.newPage(config.extraction.viewports.find((v) => v.name === 'desktop'));
        await page.goto(urls[0], { waitUntil: 'networkidle', timeout: config.extraction.timeout });
        const result = await extractDesignTokens(page, config);
        return result.tokens;
      } finally {
        await browser.close();
      }
    }
  );

  // Phase 2: Download & optimize assets
  let assets: CloneResult['assets'] = [];
  if (!options.skipAssets) {
    assets = await withSpinner(
      'Downloading and optimizing assets',
      async () => {
        const { runAssetPipeline } = await import('../../extraction/assets/pipeline.js');
        const { BrowserManager } = await import('../../extraction/browser.js');
        const browser = new BrowserManager();
        try {
          await browser.launch();
          const page = await browser.newPage();
          await page.goto(urls[0], { waitUntil: 'networkidle', timeout: config.extraction.timeout });
          return runAssetPipeline(page, config, config.output.directory);
        } finally {
          await browser.close();
        }
      }
    );
  }

  // Phase 3: Detect animations & interactions
  const [animations, interactions] = await withSpinner(
    'Analyzing animations and interactions',
    async () => {
      const { detectAnimations } = await import('../../extraction/animations/detector.js');
      const { detectInteractions } = await import('../../extraction/interactions/detector.js');
      const { BrowserManager } = await import('../../extraction/browser.js');
      const browser = new BrowserManager();
      try {
        await browser.launch();
        const page = await browser.newPage();
        await page.goto(urls[0], { waitUntil: 'networkidle', timeout: config.extraction.timeout });
        const [anims, ints] = await Promise.all([
          detectAnimations(page),
          detectInteractions(page),
        ]);
        return [anims, ints] as const;
      } finally {
        await browser.close();
      }
    }
  );

  // Phase 4: Crawl & generate routes
  const routes = await withSpinner(
    'Crawling site and generating routes',
    async () => {
      const { crawlSite } = await import('../../extraction/crawler/multi-page.js');
      const { generateRoutes } = await import('../../generation/routes/generator.js');
      const { BrowserManager } = await import('../../extraction/browser.js');
      const browser = new BrowserManager();
      try {
        await browser.launch();
        const page = await browser.newPage();
        const discoveredRoutes = await crawlSite(urls[0], page, config);
        const generatedFiles = await generateRoutes(discoveredRoutes, config.output.directory, config);
        return { routes: discoveredRoutes, files: generatedFiles };
      } finally {
        await browser.close();
      }
    }
  );

  // Phase 5: Generate component stubs
  const generatedFiles = await withSpinner(
    'Generating component stubs',
    async () => {
      const { generateComponentStubs } = await import('../../generation/components/stub-generator.js');
      const { decomposeDOM } = await import('../../generation/components/decomposer.js');
      const { BrowserManager } = await import('../../extraction/browser.js');
      const browser = new BrowserManager();
      try {
        await browser.launch();
        const page = await browser.newPage();
        await page.goto(urls[0], { waitUntil: 'networkidle', timeout: config.extraction.timeout });
        const html = await page.content();
        const tree = decomposeDOM(html, interactions);
        return generateComponentStubs(tree, config.output.directory);
      } finally {
        await browser.close();
      }
    }
  );

  // Phase 6: Audit (optional)
  let auditReport: CloneResult['auditReport'];
  if (!options.skipAudit && config.audit.enabled) {
    auditReport = await withSpinner(
      'Running quality audit',
      async () => {
        const { runAudit } = await import('../../quality/audit/runner.js');
        return runAudit(config.output.directory, config);
      }
    );
  }

  const duration = Date.now() - startTime;

  log.divider();
  log.heading('Clone Complete');
  log.table({
    'Routes': routes.routes.length.toString(),
    'Design tokens': tokens.length.toString(),
    'Assets': assets.length.toString(),
    'Components': generatedFiles.length.toString(),
    'Duration': `${(duration / 1000).toFixed(1)}s`,
  });

  if (auditReport?.lighthouse) {
    log.heading('Lighthouse Scores');
    log.table({
      'Performance': `${auditReport.lighthouse.performance}`,
      'Accessibility': `${auditReport.lighthouse.accessibility}`,
      'Best Practices': `${auditReport.lighthouse.bestPractices}`,
      'SEO': `${auditReport.lighthouse.seo}`,
    });
  }

  return {
    routes: routes.routes,
    tokens,
    assets,
    animations,
    interactions,
    generatedFiles: [...routes.files, ...generatedFiles],
    auditReport,
    duration,
  };
}

export const cloneCommand = new Command('clone')
  .description('Clone a website into a clean Next.js + Tailwind codebase')
  .argument('<urls...>', 'URL(s) to clone')
  .option('-c, --config <path>', 'Path to morph.config.ts')
  .option('-o, --output <dir>', 'Output directory')
  .option('-f, --framework <type>', 'Output framework (nextjs, vite-react, astro, static-html)')
  .option('-d, --depth <n>', 'Max crawl depth', '1')
  .option('--skip-audit', 'Skip the quality audit step')
  .option('--skip-assets', 'Skip asset download and optimization')
  .option('--viewports <list>', 'Comma-separated viewport names')
  .option('--incremental', 'Only regenerate changed sections')
  .action(async (urls: string[], options: CloneOptions) => {
    try {
      await runClone(urls, options);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
