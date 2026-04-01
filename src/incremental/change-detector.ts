import type { ChangedSection } from '../core/types.js';

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>;

export async function detectSiteChanges(
  page: Page,
  cachedHashes: Record<string, string>
): Promise<ChangedSection[]> {
  const changes: ChangedSection[] = [];

  // Get current section hashes
  const currentSections = await page.evaluate(() => {
    const sections = document.querySelectorAll('section, header, footer, main > div, [role="region"]');
    const results: Array<{ selector: string; hash: string; content: string }> = [];

    sections.forEach((section, index) => {
      const tag = section.tagName.toLowerCase();
      const cls = section.className?.toString().split(' ')[0] || '';
      const selector = cls ? `${tag}.${cls}` : `${tag}[${index}]`;

      // Simple content hash
      const content = section.innerHTML.replace(/\s+/g, ' ').trim();
      let hash = 0;
      for (let i = 0; i < Math.min(content.length, 1000); i++) {
        hash = ((hash << 5) - hash) + content.charCodeAt(i);
        hash |= 0;
      }

      results.push({
        selector,
        hash: hash.toString(36),
        content: content.slice(0, 200),
      });
    });

    return results;
  });

  for (const section of currentSections) {
    const cachedHash = cachedHashes[section.selector];
    if (!cachedHash) {
      changes.push({ name: section.selector, type: 'added' });
    } else if (cachedHash !== section.hash) {
      changes.push({ name: section.selector, type: 'modified' });
    }
  }

  // Check for removed sections
  for (const selector of Object.keys(cachedHashes)) {
    if (!currentSections.find((s) => s.selector === selector)) {
      changes.push({ name: selector, type: 'removed' });
    }
  }

  return changes;
}
