import type { BrokenLinksResult } from '../../core/types.js';

export async function checkBrokenLinks(dir: string): Promise<BrokenLinksResult> {
  const broken: BrokenLinksResult['broken'] = [];
  const redirects: BrokenLinksResult['redirects'] = [];
  let total = 0;

  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10_000 });

    // Collect all links
    const links = await page.evaluate(() => {
      return [...document.querySelectorAll('a[href]')]
        .map((a) => ({
          href: (a as HTMLAnchorElement).href,
          text: a.textContent?.trim().slice(0, 50) || '',
        }))
        .filter((l) => l.href.startsWith('http'));
    });

    total = links.length;

    // Check each link (with concurrency limit)
    const CONCURRENCY = 5;
    const queue = [...links];

    async function checkNext(): Promise<void> {
      while (queue.length > 0) {
        const link = queue.shift();
        if (!link) break;

        try {
          const response = await fetch(link.href, {
            method: 'HEAD',
            redirect: 'manual',
            signal: AbortSignal.timeout(5000),
          });

          if (response.status >= 400) {
            broken.push({
              url: link.href,
              status: response.status,
              source: link.text,
            });
          } else if (response.status >= 300 && response.status < 400) {
            redirects.push({
              url: link.href,
              redirectTo: response.headers.get('location') || '',
              source: link.text,
            });
          }
        } catch {
          broken.push({ url: link.href, status: 0, source: link.text });
        }
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => checkNext());
    await Promise.all(workers);

    await browser.close();
  } catch {
    // Failed to run link checker
  }

  return { total, broken, redirects };
}
