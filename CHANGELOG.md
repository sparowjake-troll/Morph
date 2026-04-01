# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-04-01

### Added
- **CLI tool**: `npx morph clone|extract|audit|optimize` commands for automated pipeline
- **Config system**: `morph.config.ts` with Zod validation and cosmiconfig discovery
- **Design token extraction**: Automated color, typography, spacing, shadow, and radius extraction via Playwright with oklch color space support
- **Asset pipeline**: Batched parallel download, WebP/AVIF optimization (sharp), SVG optimization (svgo), font file resolution, video poster extraction
- **Animation detection**: GSAP, Framer Motion, Lottie, CSS keyframes, scroll-driven animations, Lenis/Locomotive Scroll detection
- **Interaction detection**: Forms, modals, carousels, tabs, dropdowns, accordions with automatic RSC/Client Component classification
- **Multi-page crawl**: Same-domain BFS crawler with App Router route generation, page deduplication, and distinct page detection
- **Component decomposition**: DOM analysis → component tree with "use client" directive inference
- **Interactive patterns library**: Forms (react-hook-form + zod), focus-trapping modals, keyboard-nav tabs, touch/swipe carousels, accessible accordions, dropdown menus
- **Template gallery**: 5 hero variants, pricing comparison, testimonial carousel, feature grid, multi-column footer, sticky navbar, CTA banner
- **Visual regression testing**: Playwright screenshot comparison with pixelmatch at configurable viewports and threshold
- **Post-clone QA pipeline**: Lighthouse CI, axe-core accessibility, unused CSS detection, bundle size analysis, broken link checker
- **Incremental re-clone**: Git-based change tracking, section-level diff detection, selective regeneration
- **Figma import**: Figma REST API integration for design token extraction and component structure mapping
- **Export format adapters**: Next.js App Router (default), Vite + React, Astro, Static HTML + Tailwind CDN
- **Test infrastructure**: Vitest test runner with unit and integration test structure
- **Build tooling**: esbuild CLI bundler, separate tsconfig for CLI compilation
- **New documentation**: CLI reference, configuration guide, template catalog, contributing guide

### Changed
- Package version bumped to 2.0.0
- Package now publishes CLI binary via `bin` field
- Updated README with CLI commands, configuration, and feature matrix
- Updated AGENTS.md with CLI integration notes

## [1.0.0] - 2026-04-01

### Added
- Initial release of Morph — forked and rebranded
- Next.js 16 + shadcn/ui + Tailwind CSS v4 base scaffold
- Multi-platform AI agent support (13+ platforms)
- `/clone-website` skill for full-site cloning pipeline
- Parallel builder agents with git worktree isolation

[2.0.0]: https://github.com/mikulgohil/Morph/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/mikulgohil/Morph/releases/tag/v1.0.0
