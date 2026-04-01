import type { AnimationInventory } from '../../core/types.js';
import { ANIMATION_LIBRARIES } from '../../core/constants.js';
import { detectScrollDriven } from './scroll-driven.js';
import { buildInventory } from './inventory.js';

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof import('playwright')['chromium']['launch']>>['newPage']>>;

export async function detectAnimations(page: Page): Promise<AnimationInventory> {
  const libraryResults = await page.evaluate((libs) => {
    const results: Array<{ name: string; detected: boolean; evidence: string }> = [];

    // GSAP
    const gsapGlobals = libs.gsap.globals as readonly string[];
    const gsapDetected = gsapGlobals.some((g) => g in window);
    results.push({
      name: 'gsap',
      detected: gsapDetected,
      evidence: gsapDetected ? 'Global GSAP object found' : '',
    });

    // Framer Motion
    const fmGlobals = libs.framerMotion.globals as readonly string[];
    const fmDetected = fmGlobals.some((g) => g in window);
    results.push({
      name: 'framer-motion',
      detected: fmDetected,
      evidence: fmDetected ? 'Framer Motion global found' : '',
    });

    // Lottie
    const lottieEls = libs.lottie.elements as readonly string[];
    const lottieDetected = lottieEls.some((el) => document.querySelector(el) !== null);
    results.push({
      name: 'lottie',
      detected: lottieDetected,
      evidence: lottieDetected ? 'Lottie player element found' : '',
    });

    // Locomotive Scroll
    const locoClasses = libs.locomotive.classes as readonly string[];
    const locoDetected = locoClasses.some((cls) =>
      document.querySelector(`.${cls}`) !== null || document.querySelector(`[${cls}]`) !== null
    );
    results.push({
      name: 'locomotive-scroll',
      detected: locoDetected,
      evidence: locoDetected ? 'Locomotive Scroll classes found' : '',
    });

    // Lenis
    const lenisClasses = libs.lenis.classes as readonly string[];
    const lenisDetected = lenisClasses.some((cls) =>
      document.querySelector(`.${cls}`) !== null
    );
    results.push({
      name: 'lenis',
      detected: lenisDetected,
      evidence: lenisDetected ? 'Lenis smooth scroll classes found' : '',
    });

    return results;
  }, ANIMATION_LIBRARIES);

  // Detect CSS animations and keyframes
  const cssAnimations = await page.evaluate(() => {
    const animations: Array<{
      selector: string;
      properties: string[];
      duration: string;
      easing: string;
    }> = [];

    const elements = document.querySelectorAll('body *');
    const limit = Math.min(elements.length, 300);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      const cs = getComputedStyle(el);

      const animName = cs.animationName;
      const transition = cs.transition;

      if ((animName && animName !== 'none') || (transition && transition !== 'all 0s ease 0s')) {
        const tag = el.tagName.toLowerCase();
        const cls = el.className?.toString().split(' ')[0] || '';
        const props: string[] = [];

        if (animName && animName !== 'none') props.push(`animation: ${animName}`);
        if (transition && transition !== 'all 0s ease 0s') props.push(`transition: ${transition}`);

        animations.push({
          selector: cls ? `${tag}.${cls}` : tag,
          properties: props,
          duration: cs.animationDuration || cs.transitionDuration || '',
          easing: cs.animationTimingFunction || cs.transitionTimingFunction || '',
        });
      }
    }

    return animations;
  });

  // Detect scroll-driven animations
  const scrollDriven = await detectScrollDriven(page);

  // Build and return the inventory
  return buildInventory(libraryResults, cssAnimations, scrollDriven);
}
