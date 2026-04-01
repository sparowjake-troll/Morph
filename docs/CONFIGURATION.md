# Morph Configuration Reference

Morph uses [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) for config discovery. It searches for:

- `morph.config.ts`
- `morph.config.js`
- `morph.config.mjs`
- `morph.config.json`
- `.morphrc`
- `.morphrc.json`
- `"morph"` key in `package.json`

## Full Schema

```typescript
{
  output: {
    framework: 'nextjs' | 'vite-react' | 'astro' | 'static-html',  // default: 'nextjs'
    directory: string,         // default: '.'
    css: 'tailwind' | 'css-modules' | 'vanilla',  // default: 'tailwind'
    componentLibrary: 'shadcn' | 'none',           // default: 'shadcn'
  },

  extraction: {
    viewports: Array<{
      name: string,
      width: number,
      height: number,
    }>,                        // default: mobile (390), tablet (768), desktop (1440)
    excludePatterns: string[], // URL patterns to skip during crawl
    maxDepth: number,          // default: 1 (0-10)
    timeout: number,           // default: 30000 (ms)
    userAgent: string,         // optional custom user agent
    waitForSelector: string,   // optional selector to wait for before extracting
    javascript: boolean,       // default: true
  },

  assets: {
    download: boolean,         // default: true
    optimize: boolean,         // default: true
    formats: ('webp' | 'avif' | 'original')[],  // default: ['webp', 'original']
    maxWidth: number,          // default: 2560 (px)
    quality: number,           // default: 80 (1-100)
    skipPatterns: string[],    // URL patterns to skip
  },

  audit: {
    enabled: boolean,          // default: true
    lighthouse: boolean,       // default: true
    accessibility: boolean,    // default: true
    unusedCss: boolean,        // default: true
    bundleSize: boolean,       // default: true
    brokenLinks: boolean,      // default: true
    visualRegression: {
      enabled: boolean,        // default: true
      threshold: number,       // default: 0.05 (0-1, percentage of different pixels)
      viewports: string[],     // default: ['mobile', 'desktop']
    },
  },

  figma: {
    accessToken: string,       // or set FIGMA_ACCESS_TOKEN env var
    fileKey: string,           // Figma file key
  },

  incremental: {
    enabled: boolean,          // default: false
    cacheDir: string,          // default: '.morph-cache'
  },
}
```

## Examples

### Minimal

```typescript
export default {
  output: { framework: 'nextjs' },
};
```

### Static HTML Export

```typescript
export default {
  output: {
    framework: 'static-html',
    directory: './dist',
    componentLibrary: 'none',
  },
  assets: {
    formats: ['original'],
    optimize: false,
  },
};
```

### Production Clone with Full QA

```typescript
export default {
  extraction: {
    maxDepth: 3,
    timeout: 60000,
    viewports: [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'ultrawide', width: 2560, height: 1440 },
    ],
  },
  assets: {
    formats: ['webp', 'avif', 'original'],
    quality: 90,
  },
  audit: {
    visualRegression: {
      threshold: 0.02,
      viewports: ['mobile', 'tablet', 'desktop'],
    },
  },
};
```
