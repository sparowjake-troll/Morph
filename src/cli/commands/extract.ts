import { Command } from 'commander';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { log } from '../utils/logger.js';
import { withSpinner } from '../utils/progress.js';
import { resolveConfig } from '../utils/resolve-config.js';
import { PATHS } from '../../core/constants.js';
import type { DesignToken, ExtractedAsset, AnimationInventory, InteractionMap } from '../../core/types.js';

export interface ExtractOptions {
  config?: string;
  output?: string;
  tokensOnly?: boolean;
  assetsOnly?: boolean;
}

export interface ExtractResult {
  tokens: DesignToken[];
  assets: ExtractedAsset[];
  animations: AnimationInventory;
  interactions: InteractionMap;
}

export async function runExtract(url: string, options: ExtractOptions): Promise<ExtractResult> {
  const config = await resolveConfig(options.config);
  const outputDir = options.output ?? config.output.directory;

  log.heading('Morph Extract');
  log.table({ 'URL': url, 'Output': outputDir });
  log.divider();

  const { BrowserManager } = await import('../../extraction/browser.js');
  const browser = new BrowserManager();

  try {
    await browser.launch();
    const page = await browser.newPage(
      config.extraction.viewports.find((v) => v.name === 'desktop')
    );
    await page.goto(url, { waitUntil: 'networkidle', timeout: config.extraction.timeout });

    // Extract design tokens
    const { tokens, globalsCSS, jsonReport } = await withSpinner(
      'Extracting design tokens',
      async () => {
        const { extractDesignTokens } = await import('../../extraction/design-tokens/extractor.js');
        return extractDesignTokens(page, config);
      }
    );

    // Write token outputs
    const tokensPath = join(outputDir, PATHS.designTokens);
    await mkdir(dirname(tokensPath), { recursive: true });
    await writeFile(tokensPath, JSON.stringify(jsonReport, null, 2));
    log.success(`Design tokens → ${tokensPath}`);

    if (globalsCSS) {
      const globalsPath = join(outputDir, PATHS.globals);
      await mkdir(dirname(globalsPath), { recursive: true });
      await writeFile(globalsPath, globalsCSS);
      log.success(`Globals CSS → ${globalsPath}`);
    }

    if (options.tokensOnly) {
      return { tokens, assets: [], animations: emptyAnimations(), interactions: emptyInteractions() };
    }

    // Download assets
    let assets: ExtractedAsset[] = [];
    if (!options.assetsOnly || options.assetsOnly) {
      assets = await withSpinner(
        'Downloading assets',
        async () => {
          const { runAssetPipeline } = await import('../../extraction/assets/pipeline.js');
          return runAssetPipeline(page, config, outputDir);
        }
      );
    }

    if (options.assetsOnly) {
      return { tokens, assets, animations: emptyAnimations(), interactions: emptyInteractions() };
    }

    // Detect animations & interactions
    const [animations, interactions] = await withSpinner(
      'Analyzing animations and interactions',
      async () => {
        const { detectAnimations } = await import('../../extraction/animations/detector.js');
        const { detectInteractions } = await import('../../extraction/interactions/detector.js');
        const [anims, ints] = await Promise.all([
          detectAnimations(page),
          detectInteractions(page),
        ]);
        return [anims, ints] as const;
      }
    );

    // Write analysis outputs
    const animPath = join(outputDir, PATHS.animationInventory);
    await mkdir(dirname(animPath), { recursive: true });
    await writeFile(animPath, JSON.stringify(animations, null, 2));
    log.success(`Animation inventory → ${animPath}`);

    const intPath = join(outputDir, PATHS.interactionMap);
    await writeFile(intPath, JSON.stringify(interactions, null, 2));
    log.success(`Interaction map → ${intPath}`);

    log.divider();
    log.heading('Extraction Complete');
    log.table({
      'Design tokens': tokens.length.toString(),
      'Assets': assets.length.toString(),
      'Animations': animations.entries.length.toString(),
      'Interactive elements': countInteractions(interactions).toString(),
    });

    return { tokens, assets, animations, interactions };
  } finally {
    await browser.close();
  }
}

function emptyAnimations(): AnimationInventory {
  return { libraries: [], entries: [], scrollBehavior: { type: 'none', evidence: '' } };
}

function emptyInteractions(): InteractionMap {
  return { forms: [], modals: [], carousels: [], tabs: [], dropdowns: [], accordions: [], tooltips: [], menus: [] };
}

function countInteractions(map: InteractionMap): number {
  return Object.values(map).reduce((sum, arr) => sum + arr.length, 0);
}

export const extractCommand = new Command('extract')
  .description('Extract design tokens, assets, and analysis from a URL')
  .argument('<url>', 'URL to extract from')
  .option('-c, --config <path>', 'Path to morph.config.ts')
  .option('-o, --output <dir>', 'Output directory')
  .option('--tokens-only', 'Only extract design tokens')
  .option('--assets-only', 'Only download assets')
  .action(async (url: string, options: ExtractOptions) => {
    try {
      await runExtract(url, options);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
