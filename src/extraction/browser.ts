import { BrowserError } from '../core/errors.js';

interface Viewport {
  name?: string;
  width: number;
  height: number;
}

type Browser = Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>;
type Page = Awaited<ReturnType<Browser['newPage']>>;

export class BrowserManager {
  private browser: Browser | null = null;

  async launch(): Promise<void> {
    try {
      const { chromium } = await import('playwright');
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } catch (error) {
      throw new BrowserError(
        'Failed to launch browser. Install Playwright with: npx playwright install chromium',
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async newPage(viewport?: Viewport): Promise<Page> {
    if (!this.browser) {
      throw new BrowserError('Browser not launched. Call launch() first.');
    }

    const page = await this.browser.newPage({
      viewport: viewport
        ? { width: viewport.width, height: viewport.height }
        : { width: 1440, height: 900 },
    });

    page.setDefaultTimeout(30_000);
    page.setDefaultNavigationTimeout(30_000);

    return page;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  isLaunched(): boolean {
    return this.browser !== null;
  }
}
