import { build } from 'esbuild';

await build({
  entryPoints: ['src/cli/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  outfile: 'dist/cli/index.js',
  banner: { js: '#!/usr/bin/env node' },
  external: [
    'playwright',
    'sharp',
    'svgo',
    'lighthouse',
    'axe-core',
    '@axe-core/playwright',
    'esbuild',
  ],
  sourcemap: true,
  minify: false,
});

console.log('CLI built → dist/cli/index.js');
