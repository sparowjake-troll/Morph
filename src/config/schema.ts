import { z } from 'zod';

const ViewportSchema = z.object({
  name: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const DEFAULT_VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const OutputSchema = z.object({
  framework: z.enum(['nextjs', 'vite-react', 'astro', 'static-html']).optional().default('nextjs'),
  directory: z.string().optional().default('.'),
  css: z.enum(['tailwind', 'css-modules', 'vanilla']).optional().default('tailwind'),
  componentLibrary: z.enum(['shadcn', 'none']).optional().default('shadcn'),
});

const ExtractionSchema = z.object({
  viewports: z.array(ViewportSchema).optional().default(DEFAULT_VIEWPORTS),
  excludePatterns: z.array(z.string()).optional().default([]),
  maxDepth: z.number().int().min(0).max(10).optional().default(1),
  timeout: z.number().int().positive().optional().default(30_000),
  userAgent: z.string().optional(),
  waitForSelector: z.string().optional(),
  javascript: z.boolean().optional().default(true),
});

const AssetsSchema = z.object({
  download: z.boolean().optional().default(true),
  optimize: z.boolean().optional().default(true),
  formats: z.array(z.enum(['webp', 'avif', 'original'])).optional().default(['webp', 'original']),
  maxWidth: z.number().int().positive().optional().default(2560),
  quality: z.number().int().min(1).max(100).optional().default(80),
  skipPatterns: z.array(z.string()).optional().default([]),
});

const VisualRegressionSchema = z.object({
  enabled: z.boolean().optional().default(true),
  threshold: z.number().min(0).max(1).optional().default(0.05),
  viewports: z.array(z.string()).optional().default(['mobile', 'desktop']),
});

const AuditSchema = z.object({
  enabled: z.boolean().optional().default(true),
  lighthouse: z.boolean().optional().default(true),
  accessibility: z.boolean().optional().default(true),
  unusedCss: z.boolean().optional().default(true),
  bundleSize: z.boolean().optional().default(true),
  brokenLinks: z.boolean().optional().default(true),
  visualRegression: VisualRegressionSchema.optional().default(() => ({
    enabled: true,
    threshold: 0.05,
    viewports: ['mobile', 'desktop'],
  })),
});

const FigmaSchema = z.object({
  accessToken: z.string().optional(),
  fileKey: z.string().optional(),
});

const IncrementalSchema = z.object({
  enabled: z.boolean().optional().default(false),
  cacheDir: z.string().optional().default('.morph-cache'),
});

export const MorphConfigSchema = z.object({
  output: OutputSchema.optional().default(() => ({
    framework: 'nextjs' as const,
    directory: '.',
    css: 'tailwind' as const,
    componentLibrary: 'shadcn' as const,
  })),
  extraction: ExtractionSchema.optional().default(() => ({
    viewports: DEFAULT_VIEWPORTS,
    excludePatterns: [],
    maxDepth: 1,
    timeout: 30_000,
    javascript: true,
  })),
  assets: AssetsSchema.optional().default(() => ({
    download: true,
    optimize: true,
    formats: ['webp' as const, 'original' as const],
    maxWidth: 2560,
    quality: 80,
    skipPatterns: [],
  })),
  audit: AuditSchema.optional().default(() => ({
    enabled: true,
    lighthouse: true,
    accessibility: true,
    unusedCss: true,
    bundleSize: true,
    brokenLinks: true,
    visualRegression: { enabled: true, threshold: 0.05, viewports: ['mobile', 'desktop'] },
  })),
  figma: FigmaSchema.optional().default(() => ({})),
  incremental: IncrementalSchema.optional().default(() => ({
    enabled: false,
    cacheDir: '.morph-cache',
  })),
});

export type MorphConfig = z.infer<typeof MorphConfigSchema>;
