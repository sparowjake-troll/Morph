type Page = Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>;

export interface ScrollDrivenAnimation {
  selector: string;
  type: 'scroll-triggered' | 'scroll-linked' | 'intersection-observer' | 'parallax';
  evidence: string;
}

export async function detectScrollDriven(page: Page): Promise<ScrollDrivenAnimation[]> {
  return page.evaluate(() => {
    const results: Array<{
      selector: string;
      type: 'scroll-triggered' | 'scroll-linked' | 'intersection-observer' | 'parallax';
      evidence: string;
    }> = [];

    // Check for CSS scroll-timeline / animation-timeline
    const elements = document.querySelectorAll('body *');
    const limit = Math.min(elements.length, 300);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      const cs = getComputedStyle(el);

      // Check for scroll-driven CSS animations
      const animTimeline = (cs as unknown as Record<string, string>)['animationTimeline'];
      if (animTimeline && animTimeline !== 'auto') {
        const tag = el.tagName.toLowerCase();
        const cls = el.className?.toString().split(' ')[0] || '';
        results.push({
          selector: cls ? `${tag}.${cls}` : tag,
          type: 'scroll-linked',
          evidence: `animation-timeline: ${animTimeline}`,
        });
      }

      // Check for transform changes that suggest parallax
      const transform = cs.transform;
      if (transform && transform !== 'none') {
        const hasTranslate = transform.includes('matrix') || transform.includes('translate');
        const willChange = cs.willChange;
        if (hasTranslate && willChange && willChange.includes('transform')) {
          const tag = el.tagName.toLowerCase();
          const cls = el.className?.toString().split(' ')[0] || '';
          results.push({
            selector: cls ? `${tag}.${cls}` : tag,
            type: 'parallax',
            evidence: 'will-change: transform with active transform',
          });
        }
      }
    }

    // Check for common scroll-trigger data attributes
    const scrollTriggerSelectors = [
      '[data-scroll]', '[data-aos]', '[data-sal]', '[data-animate]',
      '[data-scroll-trigger]', '[data-inview]', '.aos-init', '.sal-animate',
    ];

    for (const selector of scrollTriggerSelectors) {
      const els = document.querySelectorAll(selector);
      if (els.length > 0) {
        results.push({
          selector,
          type: 'scroll-triggered',
          evidence: `${els.length} elements with ${selector}`,
        });
      }
    }

    return results;
  });
}
