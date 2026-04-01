export interface ComparisonResult {
  diffPixels: number;
  diffPercent: number;
  diffImage: Buffer;
  width: number;
  height: number;
}

export async function compareScreenshots(
  original: Buffer,
  clone: Buffer,
  threshold: number = 0.05
): Promise<ComparisonResult> {
  // @ts-expect-error — pngjs has no type declarations
  const { PNG } = await import('pngjs');
  const pixelmatch = (await import('pixelmatch')).default;

  const img1 = PNG.sync.read(original);
  const img2 = PNG.sync.read(clone);

  // Resize to match dimensions if needed
  const width = Math.min(img1.width, img2.width);
  const height = Math.min(img1.height, img2.height);

  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.1, includeAA: false }
  );

  const totalPixels = width * height;
  const diffPercent = totalPixels > 0 ? diffPixels / totalPixels : 0;

  return {
    diffPixels,
    diffPercent,
    diffImage: PNG.sync.write(diff),
    width,
    height,
  };
}
