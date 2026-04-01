import { stat } from 'node:fs/promises';
import { extname } from 'node:path';

interface OptimizeOptions {
  quality: number;
  maxWidth: number;
  formats: string[];
}

interface OptimizeResult {
  path: string;
  size: number;
  format: string;
}

export async function optimizeImage(
  filePath: string,
  options: OptimizeOptions
): Promise<OptimizeResult> {
  const ext = extname(filePath).toLowerCase();

  // Skip SVGs (handled by svgs.ts)
  if (ext === '.svg') {
    const s = await stat(filePath);
    return { path: filePath, size: s.size, format: 'svg' };
  }

  try {
    const sharp = (await import('sharp')).default;
    let pipeline = sharp(filePath);

    // Get metadata to check if resize is needed
    const metadata = await pipeline.metadata();
    if (metadata.width && metadata.width > options.maxWidth) {
      pipeline = pipeline.resize(options.maxWidth, undefined, { withoutEnlargement: true });
    }

    // Convert to WebP if requested
    if (options.formats.includes('webp')) {
      const outputPath = filePath.replace(/\.[^.]+$/, '.webp');
      await pipeline.webp({ quality: options.quality }).toFile(outputPath);
      const s = await stat(outputPath);
      return { path: outputPath, size: s.size, format: 'webp' };
    }

    // Convert to AVIF if requested
    if (options.formats.includes('avif')) {
      const outputPath = filePath.replace(/\.[^.]+$/, '.avif');
      await pipeline.avif({ quality: options.quality }).toFile(outputPath);
      const s = await stat(outputPath);
      return { path: outputPath, size: s.size, format: 'avif' };
    }

    // Just optimize in place
    const buffer = await pipeline.toBuffer();
    const { writeFile } = await import('node:fs/promises');
    await writeFile(filePath, buffer);
    return { path: filePath, size: buffer.length, format: ext.replace('.', '') };
  } catch {
    // If sharp fails, return original
    const s = await stat(filePath);
    return { path: filePath, size: s.size, format: ext.replace('.', '') };
  }
}
