// Morph configuration — see docs/CONFIGURATION.md for all options
// All fields are optional and have sensible defaults
const config = {
  output: {
    framework: 'nextjs' as const,
  },
  extraction: {
    viewports: [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 },
    ],
  },
  assets: {
    optimize: true,
    formats: ['webp' as const, 'original' as const],
    quality: 80,
  },
  audit: {
    enabled: true,
    lighthouse: true,
    accessibility: true,
  },
};

export default config;
