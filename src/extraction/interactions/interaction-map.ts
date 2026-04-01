import type { InteractionMap } from '../../core/types.js';

export function summarizeInteractions(map: InteractionMap): {
  total: number;
  clientComponents: number;
  serverComponents: number;
  byType: Record<string, number>;
} {
  const byType: Record<string, number> = {};
  let total = 0;
  let clientComponents = 0;
  let serverComponents = 0;

  for (const type of Object.keys(map) as Array<keyof InteractionMap>) {
    const elements = map[type];
    byType[type] = elements.length;
    total += elements.length;
    clientComponents += elements.filter((el) => el.componentType === 'client').length;
    serverComponents += elements.filter((el) => el.componentType === 'server').length;
  }

  return { total, clientComponents, serverComponents, byType };
}

export function generateInteractionReport(map: InteractionMap): string {
  const lines: string[] = [
    '# Interaction Map',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
  ];

  for (const [type, elements] of Object.entries(map)) {
    if (elements.length === 0) continue;

    lines.push(`## ${type.charAt(0).toUpperCase() + type.slice(1)} (${elements.length})`);
    lines.push('');

    for (const el of elements) {
      lines.push(`- \`${el.selector}\` — ${el.componentType} component`);
      lines.push(`  - Reason: ${el.reason}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
