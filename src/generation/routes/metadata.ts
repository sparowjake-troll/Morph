import type { PageRoute } from '../../core/types.js';

export function generateMetadata(route: PageRoute): string {
  const title = route.title || route.path.split('/').pop() || 'Page';
  const description = route.description || `Clone of ${route.url}`;

  return `export const metadata: Metadata = {
  title: '${escapeString(title)}',
  description: '${escapeString(description)}',${route.url ? `\n  alternates: { canonical: '${escapeString(route.url)}' },` : ''}
};`;
}

export function generateDynamicMetadata(route: PageRoute): string {
  const paramName = extractParamName(route.path);
  if (!paramName) return generateMetadata(route);

  return `export async function generateMetadata({
  params,
}: {
  params: Promise<{ ${paramName}: string }>;
}): Promise<Metadata> {
  const { ${paramName} } = await params;
  return {
    title: ${paramName},
    description: \`Page for \${${paramName}}\`,
  };
}`;
}

function extractParamName(path: string): string | undefined {
  const match = path.match(/\[(\w+)\]/);
  return match?.[1];
}

function escapeString(str: string): string {
  return str.replace(/'/g, "\\'").replace(/\n/g, ' ').trim();
}
