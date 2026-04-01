export const TEMPLATE_REGISTRY: Record<string, Record<string, { description: string; file: string }>> = {
  hero: {
    centered: { description: 'Centered hero with headline, subtext, and CTA buttons', file: 'heroes/centered' },
    split: { description: 'Split hero with text on left, image on right', file: 'heroes/split' },
    'video-bg': { description: 'Hero with video background and overlay text', file: 'heroes/video-bg' },
    animated: { description: 'Hero with animated gradient background', file: 'heroes/animated' },
    minimal: { description: 'Minimal hero with just a headline', file: 'heroes/minimal' },
  },
  pricing: {
    comparison: { description: 'Pricing table with 3 tiers and feature comparison', file: 'pricing/comparison' },
  },
  testimonials: {
    carousel: { description: 'Testimonial carousel with avatar, quote, and name', file: 'testimonials/carousel' },
  },
  features: {
    grid: { description: 'Feature grid with icon, title, and description', file: 'features/grid' },
  },
  footers: {
    'multi-column': { description: 'Multi-column footer with links and newsletter', file: 'footers/multi-column' },
  },
  navbars: {
    sticky: { description: 'Sticky navbar with logo, links, and CTA', file: 'navbars/sticky' },
  },
  ctas: {
    banner: { description: 'Full-width CTA banner with headline and button', file: 'ctas/banner' },
  },
};

export function listTemplates(): Array<{ category: string; variant: string; description: string }> {
  const result: Array<{ category: string; variant: string; description: string }> = [];
  for (const [category, variants] of Object.entries(TEMPLATE_REGISTRY)) {
    for (const [variant, info] of Object.entries(variants)) {
      result.push({ category, variant, description: info.description });
    }
  }
  return result;
}
