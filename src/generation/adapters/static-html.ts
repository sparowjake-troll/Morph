import type { OutputAdapter } from './types.js';
import type { GeneratedFile } from '../../core/types.js';
import type { MorphConfig } from '../../config/schema.js';

export const staticHtmlAdapter: OutputAdapter = {
  name: 'static-html',
  description: 'Static HTML + Tailwind CSS CDN',

  transform(files: GeneratedFile[], _config: MorphConfig): GeneratedFile[] {
    // For static HTML, we only output HTML files
    const pages = files.filter((f) => f.type === 'route');

    return pages.map((file) => {
      const path = file.path
        .replace(/src\/app\//, '')
        .replace(/page\.tsx$/, 'index.html');

      const title = extractTitle(file.content);
      const content = generateHtmlPage(title, file.content);

      return { ...file, path, content, type: 'route' as const };
    });
  },

  getProjectFiles(_config: MorphConfig): GeneratedFile[] {
    return [
      {
        path: 'index.html',
        type: 'route',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cloned Site</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css" />
</head>
<body class="min-h-screen bg-background text-foreground">
  <main>
    <!-- TODO: Add cloned content -->
  </main>
</body>
</html>
`,
      },
    ];
  },
};

function extractTitle(tsx: string): string {
  const match = tsx.match(/title:\s*['"]([^'"]+)['"]/);
  return match?.[1] || 'Cloned Page';
}

function generateHtmlPage(title: string, _tsx: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css" />
</head>
<body class="min-h-screen bg-background text-foreground">
  <main class="flex min-h-screen flex-col">
    <!-- TODO: Convert React components to static HTML -->
    <div class="flex flex-1 items-center justify-center">
      <p class="text-gray-500">${title} — content goes here</p>
    </div>
  </main>
</body>
</html>
`;
}
