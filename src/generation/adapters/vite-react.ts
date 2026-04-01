import type { OutputAdapter } from './types.js';
import type { GeneratedFile } from '../../core/types.js';
import type { MorphConfig } from '../../config/schema.js';

export const viteReactAdapter: OutputAdapter = {
  name: 'vite-react',
  description: 'React + Vite + React Router',

  transform(files: GeneratedFile[], _config: MorphConfig): GeneratedFile[] {
    return files.map((file) => {
      let content = file.content;
      let path = file.path;

      // Convert App Router paths to standard React paths
      path = path
        .replace(/src\/app\//, 'src/pages/')
        .replace(/page\.tsx$/, 'index.tsx')
        .replace(/layout\.tsx$/, 'Layout.tsx')
        .replace(/loading\.tsx$/, 'Loading.tsx');

      // Remove Next.js-specific imports
      content = content.replace(/import type \{ Metadata \} from 'next';?\n?/g, '');
      content = content.replace(/export const metadata: Metadata = \{[^}]+\};?\n?/g, '');
      content = content.replace(/export async function generateMetadata[^}]+\}[^}]+\}\n?/g, '');

      // Replace next/image with standard img
      content = content.replace(/import Image from 'next\/image';?\n?/g, '');
      content = content.replace(/<Image\b/g, '<img');

      // Replace next/link with react-router Link
      content = content.replace(
        /import Link from 'next\/link';/g,
        "import { Link } from 'react-router-dom';"
      );
      content = content.replace(/<Link href=/g, '<Link to=');

      return { ...file, path, content };
    });
  },

  getProjectFiles(_config: MorphConfig): GeneratedFile[] {
    return [
      {
        path: 'vite.config.ts',
        type: 'config',
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`,
      },
      {
        path: 'src/main.tsx',
        type: 'config',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
`,
      },
    ];
  },
};
