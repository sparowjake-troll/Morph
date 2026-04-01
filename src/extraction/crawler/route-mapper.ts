import type { PageRoute } from '../../core/types.js';

export function mapUrlToRoute(url: string, baseOrigin: string): Omit<PageRoute, 'title' | 'description' | 'isDistinct'> {
  const parsed = new URL(url);
  const pathname = parsed.pathname.replace(/\/$/, '') || '/';

  // Convert URL path to App Router path
  const routePath = urlToAppRouterPath(pathname);

  return {
    url,
    path: routePath,
  };
}

export function mapUrlsToRoutes(urls: string[], baseUrl: string): Array<Omit<PageRoute, 'title' | 'description' | 'isDistinct'>> {
  const origin = new URL(baseUrl).origin;
  return urls.map((url) => mapUrlToRoute(url, origin));
}

function urlToAppRouterPath(pathname: string): string {
  if (pathname === '/' || pathname === '') return '/';

  const segments = pathname.split('/').filter(Boolean);
  const routeSegments: string[] = [];

  for (const segment of segments) {
    // Detect dynamic segments (numeric IDs, UUIDs, slugs with hyphens that look like IDs)
    if (isLikelyDynamic(segment)) {
      const paramName = inferParamName(routeSegments);
      routeSegments.push(`[${paramName}]`);
    } else {
      routeSegments.push(segment);
    }
  }

  return '/' + routeSegments.join('/');
}

function isLikelyDynamic(segment: string): boolean {
  // Pure numeric
  if (/^\d+$/.test(segment)) return true;

  // UUID pattern
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return true;

  // Very long hyphenated slug (likely a blog post or article)
  if (segment.includes('-') && segment.length > 30) return true;

  return false;
}

function inferParamName(previousSegments: string[]): string {
  const parent = previousSegments[previousSegments.length - 1];

  const mapping: Record<string, string> = {
    'blog': 'slug',
    'posts': 'slug',
    'articles': 'slug',
    'products': 'id',
    'users': 'id',
    'categories': 'slug',
    'tags': 'slug',
    'pages': 'slug',
  };

  return mapping[parent] || 'slug';
}
