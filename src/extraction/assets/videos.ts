import type { ExtractedAsset } from '../../core/types.js';
import { downloadAssets, resolveAssetPath } from './downloader.js';

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>;

interface VideoInfo {
  src: string;
  poster?: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  width?: number;
  height?: number;
}

export async function extractVideos(page: Page, outputDir: string): Promise<ExtractedAsset[]> {
  const videos = await page.evaluate(() => {
    const videoElements = document.querySelectorAll('video');
    const results: VideoInfo[] = [];

    videoElements.forEach((video) => {
      const src = video.src || video.querySelector('source')?.src;
      if (!src) return;

      results.push({
        src,
        poster: video.poster || undefined,
        autoplay: video.autoplay,
        loop: video.loop,
        muted: video.muted,
        width: video.videoWidth || undefined,
        height: video.videoHeight || undefined,
      });
    });

    return results;
  });

  const tasks = videos
    .filter((v) => v.src)
    .map((v) => ({
      url: v.src,
      outputPath: resolveAssetPath(v.src, outputDir, 'public/videos'),
      type: 'video' as const,
      metadata: {
        poster: v.poster,
        autoplay: v.autoplay,
        loop: v.loop,
        muted: v.muted,
      },
    }));

  // Also download poster images
  const posterTasks = videos
    .filter((v) => v.poster)
    .map((v) => ({
      url: v.poster!,
      outputPath: resolveAssetPath(v.poster!, outputDir, 'public/images'),
      type: 'image' as const,
      metadata: { isVideoPoster: true },
    }));

  return downloadAssets([...tasks, ...posterTasks]);
}
