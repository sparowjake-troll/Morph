import type { DesignToken, ColorToken, TypographyToken } from '../core/types.js';

interface FigmaColor { r: number; g: number; b: number; a: number }
interface FigmaStyle { key: string; name: string; styleType: string; description?: string }

export function mapFigmaStylesToTokens(
  styles: FigmaStyle[],
  styleNodes?: Record<string, { document: { fills?: Array<{ color: FigmaColor }>; style?: Record<string, unknown> } }>
): DesignToken[] {
  const tokens: DesignToken[] = [];

  for (const style of styles) {
    const nodeData = styleNodes?.[style.key];

    if (style.styleType === 'FILL' && nodeData?.document?.fills?.[0]?.color) {
      const color = nodeData.document.fills[0].color;
      const hex = rgbaToHex(color);

      tokens.push({
        name: sanitizeName(style.name),
        value: hex,
        category: 'color',
        source: `figma:${style.key}`,
        hex,
        usage: inferColorUsage(style.name),
      } as ColorToken);
    }

    if (style.styleType === 'TEXT' && nodeData?.document?.style) {
      const textStyle = nodeData.document.style as Record<string, unknown>;
      tokens.push({
        name: sanitizeName(style.name),
        value: `${textStyle.fontSize || '16'}px`,
        category: 'typography',
        source: `figma:${style.key}`,
        fontFamily: textStyle.fontFamily as string || undefined,
        fontSize: `${textStyle.fontSize || 16}px`,
        fontWeight: `${textStyle.fontWeight || 400}`,
        lineHeight: textStyle.lineHeightPx ? `${textStyle.lineHeightPx}px` : undefined,
        letterSpacing: textStyle.letterSpacing ? `${textStyle.letterSpacing}px` : undefined,
      } as TypographyToken);
    }

    if (style.styleType === 'EFFECT') {
      tokens.push({
        name: sanitizeName(style.name),
        value: style.description || 'effect',
        category: 'shadow',
        source: `figma:${style.key}`,
      });
    }
  }

  return tokens;
}

function rgbaToHex(color: FigmaColor): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function inferColorUsage(name: string): ColorToken['usage'] {
  const lower = name.toLowerCase();
  if (lower.includes('background') || lower.includes('bg') || lower.includes('surface')) return 'background';
  if (lower.includes('text') || lower.includes('foreground') || lower.includes('body')) return 'foreground';
  if (lower.includes('border') || lower.includes('stroke') || lower.includes('divider')) return 'border';
  if (lower.includes('accent') || lower.includes('primary') || lower.includes('brand')) return 'accent';
  if (lower.includes('muted') || lower.includes('subtle') || lower.includes('secondary')) return 'muted';
  return 'other';
}

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
