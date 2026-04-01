import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, extname } from 'node:path';
import { DOWNLOAD_CONCURRENCY } from '../../core/constants.js';
import type { ExtractedAsset } from '../../core/types.js';

interface DownloadTask {
  url: string;
  outputPath: string;
  type: ExtractedAsset['type'];
  metadata?: Record<string, unknown>;
}

export async function downloadAssets(
  tasks: DownloadTask[],
  concurrency: number = DOWNLOAD_CONCURRENCY
): Promise<ExtractedAsset[]> {
  const results: ExtractedAsset[] = [];
  const queue = [...tasks];

  async function processNext(): Promise<void> {
    while (queue.length > 0) {
      const task = queue.shift();
      if (!task) break;

      try {
        const response = await fetch(task.url);
        if (!response.ok) continue;

        const buffer = Buffer.from(await response.arrayBuffer());
        await mkdir(dirname(task.outputPath), { recursive: true });
        await writeFile(task.outputPath, buffer);

        results.push({
          url: task.url,
          localPath: task.outputPath,
          type: task.type,
          size: buffer.length,
          metadata: task.metadata ?? {},
        });
      } catch {
        // Skip failed downloads
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => processNext());
  await Promise.all(workers);

  return results;
}

export function resolveAssetPath(url: string, baseDir: string, subDir: string): string {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const filename = pathname.split('/').pop() || 'unnamed';
    const ext = extname(filename) || '.bin';
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return join(baseDir, subDir, safeName || `asset${ext}`);
  } catch {
    const hash = url.slice(-20).replace(/[^a-zA-Z0-9]/g, '_');
    return join(baseDir, subDir, `asset_${hash}`);
  }
}
