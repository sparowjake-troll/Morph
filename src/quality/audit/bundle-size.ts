import { readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import type { BundleSizeResult } from '../../core/types.js';

export async function analyzeBundleSize(dir: string): Promise<BundleSizeResult> {
  const buildDir = join(dir, '.next');
  const chunks: BundleSizeResult['chunks'] = [];
  let jsSize = 0;
  let cssSize = 0;
  let imageSize = 0;
  let totalSize = 0;

  try {
    await walkDir(buildDir, (filePath, size) => {
      const ext = extname(filePath).toLowerCase();
      totalSize += size;

      if (ext === '.js' || ext === '.mjs') {
        jsSize += size;
        chunks.push({ name: filePath.replace(buildDir, ''), size });
      } else if (ext === '.css') {
        cssSize += size;
      } else if (['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg'].includes(ext)) {
        imageSize += size;
      }
    });
  } catch {
    // Build directory might not exist
  }

  // Sort chunks by size descending
  chunks.sort((a, b) => b.size - a.size);

  return {
    totalSize,
    jsSize,
    cssSize,
    imageSize,
    chunks: chunks.slice(0, 20), // Top 20 largest chunks
  };
}

async function walkDir(dir: string, callback: (path: string, size: number) => void): Promise<void> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkDir(fullPath, callback);
      } else {
        const s = await stat(fullPath);
        callback(fullPath, s.size);
      }
    }
  } catch {
    // Skip inaccessible directories
  }
}
