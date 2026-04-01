import type { AnimationInventory, AnimationEntry } from '../../core/types.js';
import type { ScrollDrivenAnimation } from './scroll-driven.js';

interface LibraryResult {
  name: string;
  detected: boolean;
  evidence: string;
}

interface CssAnimation {
  selector: string;
  properties: string[];
  duration: string;
  easing: string;
}

const RECOMMENDATIONS: Record<string, string> = {
  'gsap': 'Use Framer Motion or CSS animations. For complex timelines, consider GSAP with Next.js dynamic import.',
  'framer-motion': 'Keep Framer Motion — it works well with Next.js and React 19.',
  'lottie': 'Use @lottiefiles/dotlottie-react for React 19 compatibility.',
  'locomotive-scroll': 'Use Lenis for smooth scroll. It\'s lighter and React-friendly.',
  'lenis': 'Install @studio-freight/lenis and initialize in a client component.',
  'css-keyframes': 'Keep as CSS @keyframes in globals.css or component-scoped CSS.',
  'css-transition': 'Use Tailwind transition utilities (transition-all, duration-300, etc.).',
  'scroll-triggered': 'Use IntersectionObserver in a custom hook or Framer Motion whileInView.',
  'scroll-linked': 'Use CSS animation-timeline (native) or Framer Motion useScroll.',
  'parallax': 'Use Framer Motion useScroll + useTransform for parallax effects.',
};

export function buildInventory(
  libraries: LibraryResult[],
  cssAnimations: CssAnimation[],
  scrollDriven: ScrollDrivenAnimation[]
): AnimationInventory {
  const entries: AnimationEntry[] = [];

  // CSS animations
  for (const anim of cssAnimations) {
    const isKeyframe = anim.properties.some((p) => p.includes('animation:'));
    entries.push({
      selector: anim.selector,
      type: isKeyframe ? 'css-keyframes' : 'css-transition',
      properties: anim.properties,
      duration: anim.duration,
      easing: anim.easing,
      recommendation: RECOMMENDATIONS[isKeyframe ? 'css-keyframes' : 'css-transition'],
    });
  }

  // Scroll-driven animations
  for (const scroll of scrollDriven) {
    entries.push({
      selector: scroll.selector,
      type: 'scroll-driven',
      properties: [scroll.evidence],
      recommendation: RECOMMENDATIONS[scroll.type] || RECOMMENDATIONS['scroll-triggered'],
    });
  }

  // Determine scroll behavior
  const hasLenis = libraries.some((l) => l.name === 'lenis' && l.detected);
  const hasLocomotive = libraries.some((l) => l.name === 'locomotive-scroll' && l.detected);

  const scrollBehavior: AnimationInventory['scrollBehavior'] = hasLenis
    ? { type: 'lenis', evidence: 'Lenis smooth scroll detected' }
    : hasLocomotive
      ? { type: 'locomotive', evidence: 'Locomotive Scroll detected' }
      : { type: 'native', evidence: 'No custom scroll library detected' };

  return {
    libraries: libraries.map((l) => ({
      name: l.name,
      detected: l.detected,
      evidence: l.evidence,
    })),
    entries,
    scrollBehavior,
  };
}
