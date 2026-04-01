import { Command } from 'commander';
import { readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { log } from '../utils/logger.js';
import { withSpinner, ProgressTracker } from '../utils/progress.js';
import { resolveConfig } from '../utils/resolve-config.js';
import { SUPPORTED_IMAGE_FORMATS } from '../../core/constants.js';

export interface OptimizeOptions {
  config?: string;
  quality?: string;
  formats?: string;
  maxWidth?: string;
}

export interface OptimizeResult {
  totalFiles: number;
  optimizedFiles: number;
  originalSize: number;
  optimizedSize: number;
  savedBytes: number;
  savedPercent: number;
}

async function collectFiles(dir: string, extensions: readonly string[]): Promise<string[]> {
  const files: string[] = [];
  const extSet = new Set(extensions.map((e) => `.${e}`));

  async function walk(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (extSet.has(extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

export async function runOptimize(dir: string, options: OptimizeOptions): Promise<OptimizeResult> {
  const config = await resolveConfig(options.config);

  if (options.quality) config.assets.quality = parseInt(options.quality, 10);
  if (options.maxWidth) config.assets.maxWidth = parseInt(options.maxWidth, 10);

  log.heading('Morph Optimize');
  log.table({
    'Directory': dir,
    'Quality': config.assets.quality.toString(),
    'Max width': `${config.assets.maxWidth}px`,
    'Formats': config.assets.formats.join(', '),
  });
  log.divider();

  const imageFiles = await collectFiles(dir, SUPPORTED_IMAGE_FORMATS);

  if (imageFiles.length === 0) {
    log.warn('No image files found in directory');
    return { totalFiles: 0, optimizedFiles: 0, originalSize: 0, optimizedSize: 0, savedBytes: 0, savedPercent: 0 };
  }

  let originalSize = 0;
  for (const file of imageFiles) {
    const s = await stat(file);
    originalSize += s.size;
  }

  const progress = new ProgressTracker(imageFiles.length, 'Optimizing images');
  progress.start();

  let optimizedFiles = 0;
  let optimizedSize = 0;

  const { optimizeImage } = await import('../../extraction/assets/images.js');
  const { optimizeSvg } = await import('../../extraction/assets/svgs.js');

  for (const file of imageFiles) {
    const ext = extname(file).toLowerCase();
    try {
      if (ext === '.svg') {
        const result = await optimizeSvg(file);
        optimizedSize += result.size;
      } else {
        const result = await optimizeImage(file, {
          quality: config.assets.quality,
          maxWidth: config.assets.maxWidth,
          formats: config.assets.formats,
        });
        optimizedSize += result.size;
      }
      optimizedFiles++;
    } catch {
      // Skip files that fail to optimize
      const s = await stat(file);
      optimizedSize += s.size;
    }
    progress.increment(file.split('/').pop());
  }

  progress.succeed();

  const savedBytes = originalSize - optimizedSize;
  const savedPercent = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;

  log.divider();
  log.heading('Optimization Complete');
  log.table({
    'Files processed': `${optimizedFiles}/${imageFiles.length}`,
    'Original size': formatBytes(originalSize),
    'Optimized size': formatBytes(optimizedSize),
    'Saved': `${formatBytes(savedBytes)} (${savedPercent.toFixed(1)}%)`,
  });

  return {
    totalFiles: imageFiles.length,
    optimizedFiles,
    originalSize,
    optimizedSize,
    savedBytes,
    savedPercent,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export const optimizeCommand = new Command('optimize')
  .description('Optimize images and SVGs in a directory')
  .argument('[dir]', 'Directory to optimize', 'public')
  .option('-c, --config <path>', 'Path to morph.config.ts')
  .option('-q, --quality <n>', 'Image quality (1-100)')
  .option('--formats <list>', 'Output formats (webp,avif,original)')
  .option('--max-width <n>', 'Max image width in pixels')
  .action(async (dir: string, options: OptimizeOptions) => {
    try {
      await runOptimize(dir, options);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
