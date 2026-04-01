import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import type { DesignToken, CachedCloneState, ChangedSection } from '../core/types.js';
import { PATHS } from '../core/constants.js';

export async function loadCachedState(): Promise<CachedCloneState | null> {
  try {
    const data = await readFile(PATHS.cacheState, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveCachedState(state: CachedCloneState): Promise<void> {
  await mkdir(PATHS.morphCache, { recursive: true });
  await writeFile(PATHS.cacheState, JSON.stringify(state, null, 2));
}

export function buildCacheState(
  url: string,
  tokens: DesignToken[],
  componentFiles: string[]
): CachedCloneState {
  const tokenHashes: Record<string, string> = {};
  for (const token of tokens) {
    tokenHashes[token.name] = hashString(`${token.value}|${token.source}`);
  }

  const componentHashes: Record<string, string> = {};
  for (const file of componentFiles) {
    componentHashes[file] = hashString(file);
  }

  return {
    timestamp: new Date().toISOString(),
    url,
    tokenHashes,
    componentHashes,
    screenshotHashes: {},
  };
}

export function diffCloneState(
  currentTokens: DesignToken[],
  currentComponents: string[],
  cached: CachedCloneState
): ChangedSection[] {
  const changes: ChangedSection[] = [];

  // Check for changed tokens
  for (const token of currentTokens) {
    const hash = hashString(`${token.value}|${token.source}`);
    const cachedHash = cached.tokenHashes[token.name];

    if (!cachedHash) {
      changes.push({ name: `token:${token.name}`, type: 'added' });
    } else if (hash !== cachedHash) {
      changes.push({ name: `token:${token.name}`, type: 'modified' });
    }
  }

  // Check for removed tokens
  for (const name of Object.keys(cached.tokenHashes)) {
    if (!currentTokens.find((t) => t.name === name)) {
      changes.push({ name: `token:${name}`, type: 'removed' });
    }
  }

  // Check for changed components
  const currentSet = new Set(currentComponents);
  const cachedSet = new Set(Object.keys(cached.componentHashes));

  for (const comp of currentComponents) {
    if (!cachedSet.has(comp)) {
      changes.push({ name: comp, type: 'added', componentPath: comp });
    }
  }

  for (const comp of cachedSet) {
    if (!currentSet.has(comp)) {
      changes.push({ name: comp, type: 'removed', componentPath: comp });
    }
  }

  return changes;
}

function hashString(str: string): string {
  return createHash('md5').update(str).digest('hex').slice(0, 12);
}
