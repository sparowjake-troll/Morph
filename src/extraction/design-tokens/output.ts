import type { DesignToken, ColorToken, TypographyToken, SpacingToken, ShadowToken, RadiusToken } from '../../core/types.js';

export interface DesignTokenReport {
  extractedAt: string;
  url?: string;
  summary: {
    colors: number;
    typography: number;
    spacing: number;
    shadows: number;
    radii: number;
    total: number;
  };
  tokens: {
    colors: ColorToken[];
    typography: TypographyToken[];
    spacing: SpacingToken[];
    shadows: ShadowToken[];
    radii: RadiusToken[];
  };
}

export function buildTokenReport(
  colors: ColorToken[],
  typography: TypographyToken[],
  spacing: SpacingToken[],
  shadows: ShadowToken[],
  radii: RadiusToken[],
  url?: string
): DesignTokenReport {
  return {
    extractedAt: new Date().toISOString(),
    url,
    summary: {
      colors: colors.length,
      typography: typography.length,
      spacing: spacing.length,
      shadows: shadows.length,
      radii: radii.length,
      total: colors.length + typography.length + spacing.length + shadows.length + radii.length,
    },
    tokens: { colors, typography, spacing, shadows, radii },
  };
}

export function generateGlobalsCSS(
  colors: ColorToken[],
  typography: TypographyToken[],
  spacing: SpacingToken[],
  shadows: ShadowToken[],
  radii: RadiusToken[]
): string {
  const lines: string[] = [
    '@import "tailwindcss";',
    '@import "tw-animate-css";',
    '@import "shadcn/tailwind.css";',
    '',
    '@custom-variant dark (&:is(.dark *));',
    '',
    '/* ═══ Extracted Design Tokens ═══ */',
    '',
  ];

  // Theme inline block for Tailwind v4
  lines.push('@theme inline {');

  // Colors
  if (colors.length > 0) {
    lines.push('  /* Colors */');
    for (const color of colors) {
      const cssVar = `--color-${color.name}`;
      lines.push(`  ${cssVar}: var(--${color.name});`);
    }
    lines.push('');
  }

  // Font families
  const fontFamilies = typography.filter((t) => t.fontFamily);
  if (fontFamilies.length > 0) {
    lines.push('  /* Typography */');
    for (const font of fontFamilies) {
      lines.push(`  --font-${font.name.replace('font-', '')}: "${font.fontFamily}", system-ui, sans-serif;`);
    }
    lines.push('');
  }

  // Border radii
  if (radii.length > 0) {
    lines.push('  /* Border Radius */');
    for (const radius of radii) {
      lines.push(`  --radius-${radius.name.replace('radius-', '')}: ${radius.value};`);
    }
    lines.push('');
  }

  lines.push('}');
  lines.push('');

  // CSS custom properties in :root
  lines.push(':root {');

  if (colors.length > 0) {
    lines.push('  /* Colors */');
    for (const color of colors) {
      if (color.oklch) {
        lines.push(`  --${color.name}: oklch(${color.oklch.l} ${color.oklch.c} ${color.oklch.h});`);
      } else {
        lines.push(`  --${color.name}: ${color.value};`);
      }
    }
    lines.push('');
  }

  if (shadows.length > 0) {
    lines.push('  /* Shadows */');
    for (const shadow of shadows) {
      lines.push(`  --${shadow.name}: ${shadow.value};`);
    }
    lines.push('');
  }

  lines.push('}');
  lines.push('');

  // Base layer
  lines.push('@layer base {');
  lines.push('  * {');
  lines.push('    @apply border-border;');
  lines.push('  }');
  lines.push('  body {');
  lines.push('    @apply bg-background text-foreground;');
  lines.push('  }');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

export function flattenTokens(
  colors: ColorToken[],
  typography: TypographyToken[],
  spacing: SpacingToken[],
  shadows: ShadowToken[],
  radii: RadiusToken[]
): DesignToken[] {
  return [
    ...colors,
    ...typography,
    ...spacing,
    ...shadows,
    ...radii,
  ];
}
