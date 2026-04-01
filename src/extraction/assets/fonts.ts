import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import type { ExtractedAsset } from '../../core/types.js';

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>;

interface FontInfo {
  family: string;
  url: string;
  format: string;
  weight?: string;
  style?: string;
}

export async function extractFonts(page: Page, outputDir: string): Promise<ExtractedAsset[]> {
  const fonts = await page.evaluate(() => {
    const results: Array<{
      family: string;
      url: string;
      format: string;
      weight?: string;
      style?: string;
    }> = [];

    // Extract from <link> tags
    const linkTags = document.querySelectorAll('link[rel="stylesheet"], link[as="font"]');
    linkTags.forEach((link) => {
      const href = (link as HTMLLinkElement).href;
      if (href && (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com'))) {
        results.push({ family: 'google-fonts', url: href, format: 'css' });
      }
    });

    // Extract from @font-face rules in stylesheets
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule instanceof CSSFontFaceRule) {
              const family = rule.style.getPropertyValue('font-family').replace(/['"]/g, '');
              const src = rule.style.getPropertyValue('src');
              const weight = rule.style.getPropertyValue('font-weight');
              const style = rule.style.getPropertyValue('font-style');

              const urlMatch = src.match(/url\(['"]?([^'")\s]+)['"]?\)/);
              if (urlMatch) {
                const formatMatch = src.match(/format\(['"]?(\w+)['"]?\)/);
                results.push({
                  family,
                  url: urlMatch[1],
                  format: formatMatch?.[1] || 'unknown',
                  weight: weight || undefined,
                  style: style || undefined,
                });
              }
            }
          }
        } catch {
          // CORS-blocked stylesheets
        }
      }
    } catch {
      // Stylesheets not accessible
    }

    return results;
  });

  const assets: ExtractedAsset[] = [];
  const fontDir = join(outputDir, 'public/fonts');

  for (const font of fonts) {
    if (font.format === 'css') continue; // Google Fonts CSS — handled by next/font

    try {
      const response = await fetch(font.url);
      if (!response.ok) continue;

      const buffer = Buffer.from(await response.arrayBuffer());
      const safeName = `${font.family.replace(/[^a-zA-Z0-9]/g, '-')}-${font.weight || 'regular'}.${font.format}`;
      const outputPath = join(fontDir, safeName);

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, buffer);

      assets.push({
        url: font.url,
        localPath: outputPath,
        type: 'font',
        size: buffer.length,
        metadata: {
          family: font.family,
          weight: font.weight,
          style: font.style,
          format: font.format,
        },
      });
    } catch {
      // Skip failed font downloads
    }
  }

  return assets;
}

export function generateFontImports(fonts: FontInfo[]): string {
  const googleFonts = fonts.filter((f) => f.format === 'css');
  const localFonts = fonts.filter((f) => f.format !== 'css');

  const lines: string[] = [];

  // Google Fonts via next/font
  const families = new Set(googleFonts.map((f) => f.family));
  for (const family of families) {
    if (family === 'google-fonts') continue;
    const safeName = family.replace(/[^a-zA-Z]/g, '');
    lines.push(`import { ${safeName} } from 'next/font/google';`);
  }

  // Local fonts
  if (localFonts.length > 0) {
    lines.push("import localFont from 'next/font/local';");
  }

  return lines.join('\n');
}
