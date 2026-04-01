import type { OutputAdapter } from './types.js';
import type { GeneratedFile } from '../../core/types.js';
import type { MorphConfig } from '../../config/schema.js';

export const nextjsAdapter: OutputAdapter = {
  name: 'nextjs',
  description: 'Next.js App Router (default)',

  transform(files: GeneratedFile[], _config: MorphConfig): GeneratedFile[] {
    // Next.js is the native output format — no transformation needed
    return files;
  },

  getProjectFiles(_config: MorphConfig): GeneratedFile[] {
    // Next.js project files are already in the scaffold
    return [];
  },
};
