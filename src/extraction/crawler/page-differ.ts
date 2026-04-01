import type { PageRoute } from '../../core/types.js';

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>;

interface PageSignature {
  structureHash: string;
  textLength: number;
  elementCount: number;
  headingStructure: string[];
}

export async function getPageSignature(page: Page): Promise<PageSignature> {
  return page.evaluate(() => {
    // Get structural fingerprint
    const structure = document.querySelector('main, [role="main"], #main, .main, body');
    const elements = structure ? structure.querySelectorAll('*') : document.querySelectorAll('body *');

    const tagSequence = [...elements].slice(0, 100).map((el) => el.tagName).join(',');
    const textLength = document.body.textContent?.length || 0;
    const elementCount = elements.length;

    const headings = [...document.querySelectorAll('h1, h2, h3')].map(
      (h) => `${h.tagName}:${h.textContent?.trim().slice(0, 50)}`
    );

    // Simple hash of tag sequence
    let hash = 0;
    for (let i = 0; i < tagSequence.length; i++) {
      const char = tagSequence.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }

    return {
      structureHash: hash.toString(36),
      textLength,
      elementCount,
      headingStructure: headings,
    };
  });
}

export function arePagesDistinct(sig1: PageSignature, sig2: PageSignature): boolean {
  // Same structure hash = likely same template
  if (sig1.structureHash === sig2.structureHash) {
    // But different content means distinct pages (e.g., blog posts)
    if (Math.abs(sig1.textLength - sig2.textLength) > 100) return true;
    if (sig1.headingStructure.join() !== sig2.headingStructure.join()) return true;
    return false;
  }

  return true;
}

export function markDistinctRoutes(routes: PageRoute[], signatures: Map<string, PageSignature>): PageRoute[] {
  const seen = new Map<string, PageRoute>();

  return routes.map((route) => {
    const sig = signatures.get(route.url);
    if (!sig) return { ...route, isDistinct: true };

    // Check against all previously seen signatures
    for (const [seenUrl, seenRoute] of seen) {
      const seenSig = signatures.get(seenUrl);
      if (seenSig && !arePagesDistinct(sig, seenSig)) {
        return { ...route, isDistinct: false, template: seenRoute.path };
      }
    }

    seen.set(route.url, route);
    return { ...route, isDistinct: true };
  });
}
