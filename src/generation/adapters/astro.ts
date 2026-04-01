import type { OutputAdapter } from './types.js';
import type { GeneratedFile } from '../../core/types.js';
import type { MorphConfig } from '../../config/schema.js';

export const astroAdapter: OutputAdapter = {
  name: 'astro',
  description: 'Astro with React islands',

  transform(files: GeneratedFile[], _config: MorphConfig): GeneratedFile[] {
    return files.map((file) => {
      let content = file.content;
      let path = file.path;

      // Convert page routes to Astro pages
      if (file.type === 'route') {
        path = path
          .replace(/src\/app\//, 'src/pages/')
          .replace(/page\.tsx$/, 'index.astro')
          .replace(/loading\.tsx$/, ''); // Astro doesn't have loading states

        if (path.endsWith('/')) return null;

        // Convert to Astro page format
        const componentImports = extractImports(content);
        content = `---
${componentImports}
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <main>
      <!-- TODO: Add components -->
    </main>
  </body>
</html>
`;
      }

      // Components stay as .tsx but add client:visible for interactive ones
      if (file.type === 'component' && content.includes("'use client'")) {
        // Mark as client component for Astro
        content = content.replace("'use client';", '// Astro: use client:visible directive when importing');
      }

      return { ...file, path, content };
    }).filter(Boolean) as GeneratedFile[];
  },

  getProjectFiles(_config: MorphConfig): GeneratedFile[] {
    return [
      {
        path: 'astro.config.mjs',
        type: 'config',
        content: `import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
});
`,
      },
    ];
  },
};

function extractImports(content: string): string {
  const importLines = content.match(/^import .+$/gm) || [];
  return importLines
    .filter((line) => !line.includes("'next"))
    .join('\n');
}
