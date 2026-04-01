export const DEFAULT_VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

export const PATHS = {
  designTokens: 'docs/research/design-tokens.json',
  behaviors: 'docs/research/BEHAVIORS.md',
  pageTopology: 'docs/research/PAGE_TOPOLOGY.md',
  componentSpecs: 'docs/research/components',
  designReferences: 'docs/design-references',
  interactionMap: 'docs/research/interaction-map.json',
  animationInventory: 'docs/research/animation-inventory.json',
  morphCache: '.morph-cache',
  cacheState: '.morph-cache/state.json',
  auditReport: '.morph-cache/audit-report.html',
  publicImages: 'public/images',
  publicVideos: 'public/videos',
  publicSeo: 'public/seo',
  publicFonts: 'public/fonts',
  srcComponents: 'src/components',
  srcApp: 'src/app',
  srcTypes: 'src/types',
  srcHooks: 'src/hooks',
  icons: 'src/components/icons.tsx',
  globals: 'src/app/globals.css',
  layout: 'src/app/layout.tsx',
} as const;

export const DOWNLOAD_CONCURRENCY = 4;
export const MAX_CRAWL_DEPTH = 3;
export const MAX_PAGES = 50;
export const SCREENSHOT_TIMEOUT = 30_000;
export const PAGE_LOAD_TIMEOUT = 30_000;

export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'ico'] as const;
export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'webm', 'ogg', 'mov'] as const;
export const SUPPORTED_FONT_FORMATS = ['woff', 'woff2', 'ttf', 'otf', 'eot'] as const;

export const ANIMATION_LIBRARIES = {
  gsap: {
    globals: ['gsap', 'TweenMax', 'TweenLite', 'TimelineMax', 'TimelineLite', 'ScrollTrigger'],
    scripts: ['gsap.min.js', 'gsap-latest-beta', 'cdnjs.cloudflare.com/ajax/libs/gsap'],
  },
  framerMotion: {
    globals: ['__FRAMER_MOTION__'],
    imports: ['framer-motion', 'motion'],
  },
  lottie: {
    elements: ['lottie-player', 'dotlottie-player'],
    scripts: ['lottie-web', 'lottie.min.js', '@dotlottie/player-component'],
  },
  locomotive: {
    classes: ['locomotive-scroll', 'has-scroll-smooth', 'data-scroll-container'],
    scripts: ['locomotive-scroll'],
  },
  lenis: {
    classes: ['lenis', 'lenis-smooth'],
    scripts: ['@studio-freight/lenis', 'lenis'],
  },
} as const;

export const INTERACTIVE_SELECTORS = {
  forms: ['form', '[role="form"]'],
  modals: ['[role="dialog"]', '[aria-modal="true"]', '.modal', '[data-modal]'],
  carousels: ['[role="region"][aria-roledescription="carousel"]', '.carousel', '.swiper', '[data-carousel]', '.slick-slider'],
  tabs: ['[role="tablist"]', '.tabs', '[data-tabs]'],
  dropdowns: ['[role="menu"]', '[role="listbox"]', '.dropdown', '[data-dropdown]', 'select'],
  accordions: ['[role="accordion"]', '.accordion', '[data-accordion]', 'details'],
  tooltips: ['[role="tooltip"]', '[data-tooltip]', '.tooltip'],
  menus: ['nav [role="menubar"]', '[role="navigation"]', '.nav-menu'],
} as const;

export const CSS_PROPERTIES_TO_EXTRACT = [
  'fontSize', 'fontWeight', 'fontFamily', 'lineHeight', 'letterSpacing', 'color',
  'textTransform', 'textDecoration', 'backgroundColor', 'background',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'width', 'height', 'maxWidth', 'minWidth', 'maxHeight', 'minHeight',
  'display', 'flexDirection', 'justifyContent', 'alignItems', 'gap',
  'gridTemplateColumns', 'gridTemplateRows',
  'borderRadius', 'border', 'borderTop', 'borderBottom', 'borderLeft', 'borderRight',
  'boxShadow', 'overflow', 'overflowX', 'overflowY',
  'position', 'top', 'right', 'bottom', 'left', 'zIndex',
  'opacity', 'transform', 'transition', 'cursor',
  'objectFit', 'objectPosition', 'mixBlendMode', 'filter', 'backdropFilter',
  'whiteSpace', 'textOverflow',
] as const;
