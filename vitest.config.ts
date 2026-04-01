import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', '.next', 'dist'],
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: ['src/cli/**', 'src/config/**', 'src/core/**', 'src/extraction/**', 'src/generation/**', 'src/quality/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
