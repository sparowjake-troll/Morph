export { generateFormPattern } from './forms.js';
export { generateModalPattern } from './modals.js';
export { generateTabsPattern } from './tabs.js';
export { generateCarouselPattern } from './carousels.js';
export { generateAccordionPattern } from './accordions.js';
export { generateDropdownPattern } from './dropdowns.js';

export const PATTERN_REGISTRY = {
  form: 'forms',
  modal: 'modals',
  tabs: 'tabs',
  carousel: 'carousels',
  accordion: 'accordions',
  dropdown: 'dropdowns',
} as const;
