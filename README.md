# Morph

<a href="https://github.com/mikulgohil/Morph/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a> <a href="https://github.com/mikulgohil/Morph"><img src="https://img.shields.io/github/stars/mikulgohil/Morph?style=flat" alt="Stars" /></a>

**Clone any website into a clean, production-ready Next.js + Tailwind CSS codebase.**

Morph gives you two paths: a **CLI tool** (`npx morph clone <url>`) that automates extraction and scaffolding, or an **AI agent pipeline** (`/clone-website`) that uses Claude Code, Cursor, or 11 other AI coding agents to reverse-engineer sites with pixel-perfect fidelity.

Point it at a URL. It extracts design tokens, downloads assets, detects animations and interactions, crawls pages, generates App Router routes, decomposes components, and runs a full QA audit — all automatically.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [CLI Reference](#cli-reference)
- [AI Agent Workflow](#ai-agent-workflow)
- [Configuration](#configuration)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Supported AI Platforms](#supported-ai-platforms)
- [Template Gallery](#template-gallery)
- [Interactive Pattern Library](#interactive-pattern-library)
- [Export Formats](#export-formats)
- [Development](#development)
- [Ethical Use](#ethical-use)
- [License](#license)

---

## Features

### Extraction Engine
| Feature | Description |
|---------|-------------|
| **Design Token Extraction** | Colors (oklch), typography, spacing, shadows, border-radii — all from `getComputedStyle()` via Playwright |
| **Asset Pipeline** | Parallel download of images, videos, fonts, favicons. WebP/AVIF optimization via sharp. SVG optimization via svgo. Inline SVG extraction as React components. |
| **Animation Detection** | Detects GSAP, Framer Motion, Lottie, CSS keyframes, scroll-driven animations, Lenis, and Locomotive Scroll — with Next.js migration recommendations |
| **Interaction Detection** | Identifies forms, modals, carousels, tabs, dropdowns, accordions, tooltips, and menus. Auto-classifies each as Server Component or Client Component. |
| **Multi-Page Crawling** | BFS same-domain crawler with configurable depth. Deduplicates pages, detects dynamic route segments, maps URLs to App Router paths. |

### Code Generation
| Feature | Description |
|---------|-------------|
| **Route Generation** | Generates `page.tsx`, `layout.tsx`, `loading.tsx` per route with `generateMetadata()` |
| **Component Decomposition** | Analyzes DOM structure, infers component boundaries, generates stubs with proper `"use client"` directives |
| **Template Gallery** | 12 pre-built templates: 5 hero variants, pricing table, testimonial carousel, feature grid, footer, navbar, CTA banner |
| **Interactive Patterns** | Accessible patterns: forms (react-hook-form + zod), focus-trapping modals, keyboard-nav tabs, touch/swipe carousels, accordions, dropdown menus |
| **Export Adapters** | Output as Next.js App Router (default), Vite + React, Astro, or static HTML + Tailwind CDN |

### Quality Assurance
| Feature | Description |
|---------|-------------|
| **Visual Regression** | Screenshot clone vs original at multiple viewports. Pixel-diff with configurable threshold. HTML report with side-by-side comparison. |
| **Lighthouse Audit** | Performance, accessibility, best practices, SEO scores |
| **Accessibility Audit** | axe-core WCAG compliance scan with violation severity |
| **Bundle Analysis** | JS, CSS, and image size breakdown with top 20 largest chunks |
| **Broken Link Checker** | Validates all links with redirect detection |
| **Unused CSS Detection** | Chrome Coverage API to find dead CSS rules |

### Advanced
| Feature | Description |
|---------|-------------|
| **Incremental Re-clone** | Hashes tokens and components, diffs against cached state, only regenerates changed sections |
| **Figma Import** | Extract design tokens and component structure from Figma files via REST API |
| **13+ AI Agent Support** | Works with Claude Code, Codex CLI, OpenCode, GitHub Copilot, Cursor, Windsurf, Gemini CLI, Cline, Roo Code, Continue, Amazon Q, Augment Code, and Aider |

---

## Quick Start

### Option A: CLI (Automated)

```bash
# Clone a website
npx morph clone https://example.com

# Extract design tokens only
npx morph extract https://stripe.com --tokens-only

# Optimize existing images
npx morph optimize public/ --quality 85 --formats webp,avif

# Run quality audit
npx morph audit --original-url https://example.com --clone-url http://localhost:3000
```

### Option B: AI Agent (Recommended for pixel-perfect results)

```bash
# 1. Clone this repo
git clone https://github.com/mikulgohil/Morph.git my-clone
cd my-clone

# 2. Install dependencies
npm install

# 3. Install Playwright (required for extraction)
npx playwright install chromium

# 4. Start Claude Code with browser access
claude --chrome

# 5. Run the clone skill
/clone-website https://example.com
```

> **Why AI agents?** The CLI automates extraction and scaffolding, but AI agents handle the judgment calls: pixel-perfect CSS matching, animation recreation, responsive behavior tuning, and visual QA. The CLI pre-extracts tokens and assets so the agent can focus on what it does best.

### Option C: Docker

```bash
# Production build
docker compose up app --build

# Development with hot reload
docker compose up dev --build
```

---

## CLI Reference

### `morph clone <urls...>`

Full pipeline: extract tokens, download assets, detect animations/interactions, crawl pages, generate routes and components, run audit.

```bash
morph clone https://example.com
morph clone https://example.com https://example.com/pricing --depth 2
morph clone https://stripe.com -f vite-react -o ./stripe-clone
```

| Option | Description | Default |
|--------|-------------|---------|
| `-c, --config <path>` | Path to morph.config.ts | Auto-discovered |
| `-o, --output <dir>` | Output directory | `.` |
| `-f, --framework <type>` | `nextjs`, `vite-react`, `astro`, `static-html` | `nextjs` |
| `-d, --depth <n>` | Max crawl depth (0 = single page) | `1` |
| `--skip-audit` | Skip the quality audit step | `false` |
| `--skip-assets` | Skip asset download and optimization | `false` |
| `--viewports <list>` | Comma-separated viewport names | All configured |
| `--incremental` | Only regenerate changed sections | `false` |

### `morph extract <url>`

Extract design tokens, assets, and analysis without generating code. Useful for pre-feeding data to an AI agent.

```bash
morph extract https://example.com
morph extract https://example.com --tokens-only -o ./research
```

| Option | Description | Default |
|--------|-------------|---------|
| `-c, --config <path>` | Config file path | Auto-discovered |
| `-o, --output <dir>` | Output directory | `.` |
| `--tokens-only` | Only extract design tokens | `false` |
| `--assets-only` | Only download and optimize assets | `false` |

**Outputs:**
- `docs/research/design-tokens.json` — Colors, typography, spacing, shadows, radii
- `src/app/globals.css` — Updated with extracted oklch tokens
- `docs/research/animation-inventory.json` — Detected animations + recommendations
- `docs/research/interaction-map.json` — Interactive elements + RSC/Client classification
- `public/images/`, `public/fonts/`, `public/seo/` — Downloaded assets
- `src/components/icons.tsx` — Extracted SVGs as React components

### `morph audit [dir]`

Run quality checks on your clone.

```bash
morph audit
morph audit --original-url https://example.com --clone-url http://localhost:3000
morph audit --lighthouse-only
morph audit --a11y-only
```

| Option | Description | Default |
|--------|-------------|---------|
| `--original-url <url>` | Original site URL (for visual regression) | — |
| `--clone-url <url>` | Local clone URL (for visual regression) | — |
| `--lighthouse-only` | Only run Lighthouse | `false` |
| `--a11y-only` | Only run accessibility audit | `false` |
| `--visual-only` | Only run visual regression | `false` |

**Outputs:**
- `.morph-cache/audit-report.html` — Visual regression report with side-by-side screenshots
- Console output with Lighthouse scores, a11y violations, bundle sizes, broken links

### `morph optimize [dir]`

Optimize images and SVGs in a directory.

```bash
morph optimize public/
morph optimize public/ -q 90 --formats webp,avif --max-width 1920
```

| Option | Description | Default |
|--------|-------------|---------|
| `-q, --quality <n>` | Image quality (1-100) | `80` |
| `--formats <list>` | Output formats: webp, avif, original | `webp,original` |
| `--max-width <n>` | Max image width (px) | `2560` |

---

## AI Agent Workflow

When using an AI coding agent (Claude Code recommended), the `/clone-website` skill runs a 5-phase pipeline:

### Phase 1: Reconnaissance
- Full-page screenshots at desktop (1440px) and mobile (390px)
- Global extraction: fonts, colors, favicons, global CSS patterns (smooth scroll, scroll-snap)
- **Mandatory interaction sweep**: scroll, click, hover, and responsive behavior discovery
- Page topology mapping — documents every section, its order, and dependencies

### Phase 2: Foundation Build
- Configure fonts in `layout.tsx` using `next/font`
- Update `globals.css` with extracted color tokens (oklch), spacing, animations
- Create TypeScript interfaces in `src/types/`
- Extract inline SVGs to `src/components/icons.tsx`
- Download all assets via batched parallel downloader

### Phase 3: Component Specification & Dispatch
For each section (top to bottom):
1. **Extract** — screenshot, CSS via `getComputedStyle()`, multi-state styles, real content, assets
2. **Write spec** — detailed spec file to `docs/research/components/<name>.spec.md`
3. **Dispatch builder** — agent works in its own git worktree. Receives the full spec inline — exact computed CSS values, interaction models, responsive breakpoints, asset paths. No guessing.
4. **Merge** — as builders complete, merge worktree branches with smart conflict resolution

### Phase 4: Page Assembly
Wire all section components into `src/app/page.tsx`. Implement page-level layout (scroll containers, sticky positioning, z-index layers) and page-level behaviors (scroll snap, Lenis smooth scroll, dark/light transitions).

### Phase 5: Visual QA Diff
Side-by-side comparison at desktop and mobile. Test all interactive behaviors. Fix any discrepancies against the component spec files.

> **Pre-check:** If `docs/research/design-tokens.json` exists (from `morph extract`), the agent skips manual token extraction and focuses on the interaction sweep and component building.

---

## Configuration

Create `morph.config.ts` in your project root:

```typescript
export default {
  // Output format
  output: {
    framework: 'nextjs',          // nextjs | vite-react | astro | static-html
    directory: '.',                // output directory
    css: 'tailwind',              // tailwind | css-modules | vanilla
    componentLibrary: 'shadcn',   // shadcn | none
  },

  // Extraction settings
  extraction: {
    viewports: [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 },
    ],
    excludePatterns: ['/admin', '/api'],  // URLs to skip during crawl
    maxDepth: 1,                           // crawl depth (0 = single page)
    timeout: 30000,                        // page load timeout (ms)
  },

  // Asset optimization
  assets: {
    download: true,
    optimize: true,
    formats: ['webp', 'original'],  // webp | avif | original
    quality: 80,                    // 1-100
    maxWidth: 2560,                 // resize images wider than this
  },

  // Quality audit
  audit: {
    enabled: true,
    lighthouse: true,
    accessibility: true,
    unusedCss: true,
    bundleSize: true,
    brokenLinks: true,
    visualRegression: {
      enabled: true,
      threshold: 0.05,              // 5% pixel diff tolerance
      viewports: ['mobile', 'desktop'],
    },
  },

  // Figma import (optional)
  figma: {
    accessToken: process.env.FIGMA_ACCESS_TOKEN,
    fileKey: 'your-figma-file-key',
  },

  // Incremental re-clone
  incremental: {
    enabled: false,
    cacheDir: '.morph-cache',
  },
};
```

Config is discovered automatically via [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig). Supports: `morph.config.ts`, `morph.config.js`, `morph.config.json`, `.morphrc`, or `"morph"` key in `package.json`.

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for the complete schema reference.

---

## How It Works

### Design Token Extraction

Morph uses Playwright to render the target page in a real Chromium browser, then runs `getComputedStyle()` on up to 500 visible elements. It extracts:

- **Colors** — Every `color`, `backgroundColor`, `borderColor` value. Deduplicates by visual similarity, converts to oklch (Tailwind v4 native), generates CSS custom properties.
- **Typography** — Font families, size scale, weights, line heights, letter spacing. Maps heading tags to semantic names.
- **Spacing** — Padding, margin, gap values. Clusters within 2px tolerance, snaps to Tailwind's 4px base scale.
- **Shadows** — `boxShadow` values parsed into offset, blur, spread, color components.
- **Border Radii** — Mapped to Tailwind's radius scale (sm, md, lg, xl, full).

Output: `design-tokens.json` report + updated `globals.css` with oklch tokens.

### Component Classification

Every interactive element is classified as either a **Server Component** (default, rendered on the server) or a **Client Component** (`"use client"` directive needed):

| Element | Classification | Reason |
|---------|---------------|--------|
| Forms | Client | Validation, submission, state |
| Modals | Client | Focus trapping, portal rendering |
| Carousels | Client | Scroll/swipe handling, autoplay |
| Tabs | Client | Active tab state management |
| Dropdowns | Client | Toggle state, outside-click handling |
| Static nav | Server | No interactivity needed |
| Footer | Server | Pure presentation |

### Animation Detection

Morph checks for:
- **Global objects**: `window.gsap`, `__FRAMER_MOTION__`
- **DOM elements**: `<lottie-player>`, `<dotlottie-player>`
- **CSS classes**: `.lenis`, `.locomotive-scroll`, `.aos-init`, `[data-scroll]`
- **Stylesheets**: `@keyframes`, `animation-timeline`, `scroll-timeline`

Each detected animation gets a migration recommendation (e.g., "Use Framer Motion `useScroll` + `useTransform` for parallax effects").

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| UI | React | 19.2.4 |
| Language | TypeScript (strict) | 5+ |
| Styling | Tailwind CSS v4 (oklch tokens) | 4+ |
| Components | shadcn/ui (base-nova) | 4.1.0 |
| Browser Automation | Playwright | 1.52+ |
| Image Optimization | sharp | 0.33+ |
| SVG Optimization | svgo | 3+ |
| CLI Framework | Commander.js | 14+ |
| Validation | Zod | 4+ |
| Forms | react-hook-form | 7+ |
| HTML Parsing | cheerio | 1.0+ |
| Visual Diff | pixelmatch + pngjs | 7+ |
| Testing | Vitest | 4+ |
| Bundling | esbuild | 0.25+ |

---

## Project Structure

```
src/
  app/                    # Next.js App Router
    layout.tsx            # Root layout (fonts, metadata)
    page.tsx              # Home page
    globals.css           # Design tokens (oklch)
  cli/                    # CLI tool
    index.ts              # Entry point (commander program)
    commands/
      clone.ts            # morph clone <urls...>
      extract.ts          # morph extract <url>
      audit.ts            # morph audit [dir]
      optimize.ts         # morph optimize [dir]
    utils/
      logger.ts           # Chalk-based console output
      progress.ts         # Ora spinners and progress tracking
      resolve-config.ts   # Cosmiconfig loader
  config/                 # Configuration system
    schema.ts             # Zod schema for morph.config.ts
    defaults.ts           # Default configuration values
    types.ts              # Exported TypeScript types
  core/                   # Shared infrastructure
    types.ts              # 200+ lines of shared types
    errors.ts             # Custom error hierarchy
    constants.ts          # Viewports, paths, selectors, CSS properties
  extraction/             # Data extraction via Playwright
    browser.ts            # Browser lifecycle manager
    design-tokens/        # Color, typography, spacing, shadow, radius extractors
    assets/               # Download, optimize images/SVGs/fonts/videos
    animations/           # GSAP/Framer/Lottie/CSS/scroll detection
    interactions/         # Form/modal/tab/carousel detection + RSC classifier
    crawler/              # Multi-page BFS crawler + route mapper
  generation/             # Code generation
    routes/               # App Router route generator
    components/           # DOM decomposer + component stub generator
    patterns/             # Interactive patterns (forms, modals, tabs, carousels, etc.)
    templates/            # Pre-built section templates (heroes, pricing, etc.)
    adapters/             # Export format adapters (Next.js, Vite, Astro, static HTML)
  quality/                # QA pipeline
    visual-regression/    # Screenshot comparison + HTML report
    audit/                # Lighthouse, axe-core, unused CSS, bundle size, broken links
  incremental/            # Change detection + selective regeneration
  figma/                  # Figma API client + token/component mapping
  components/             # React components
    ui/button.tsx         # shadcn/ui button (CVA variants)
  lib/utils.ts            # cn() utility

docs/
  CLI.md                  # Full CLI reference
  CONFIGURATION.md        # Config schema reference
  TEMPLATES.md            # Template gallery catalog
  CONTRIBUTING.md         # How to add extractors, patterns, adapters
  research/
    INSPECTION_GUIDE.md   # Website reverse-engineering methodology

public/
  images/                 # Downloaded images from target
  videos/                 # Downloaded videos from target
  fonts/                  # Downloaded font files
  seo/                    # Favicons, OG images, webmanifest

scripts/
  build-cli.ts            # esbuild CLI bundler
  sync-agent-rules.sh     # Regenerate platform agent configs from AGENTS.md
  sync-skills.mjs         # Regenerate /clone-website skill for all platforms

tests/
  unit/                   # Unit tests (Vitest)
  integration/            # Integration tests
  fixtures/               # Test fixtures
```

---

## Supported AI Platforms

Morph's agent instructions are managed via a single source of truth (`AGENTS.md`) with automated sync to 13 platforms:

| Agent | Status | Config |
|-------|--------|--------|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | **Recommended** (Opus 4.6) | `CLAUDE.md` → `@AGENTS.md` |
| [Codex CLI](https://github.com/openai/codex) | Supported | Reads `AGENTS.md` natively |
| [OpenCode](https://opencode.ai/) | Supported | Reads `AGENTS.md` natively |
| [GitHub Copilot](https://github.com/features/copilot) | Supported | `.github/copilot-instructions.md` (auto-generated) |
| [Cursor](https://cursor.com/) | Supported | `.cursor/rules/project.mdc` (pointer) |
| [Windsurf](https://codeium.com/windsurf) | Supported | `.windsurfrules` (pointer) |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | Supported | `GEMINI.md` → `@AGENTS.md` |
| [Cline](https://github.com/cline/cline) | Supported | `.clinerules` (auto-generated) |
| [Roo Code](https://github.com/RooCodeInc/Roo-Code) | Supported | Reads `AGENTS.md` natively |
| [Continue](https://continue.dev/) | Supported | `.continue/rules/project.md` (auto-generated) |
| [Amazon Q](https://aws.amazon.com/q/developer/) | Supported | `.amazonq/rules/project.md` (auto-generated) |
| [Augment Code](https://www.augmentcode.com/) | Supported | Reads `AGENTS.md` natively |
| [Aider](https://aider.chat/) | Supported | `.aider.conf.yml` (pointer) |

**Updating instructions across all platforms:**
```bash
# After editing AGENTS.md:
bash scripts/sync-agent-rules.sh

# After editing .claude/skills/clone-website/SKILL.md:
node scripts/sync-skills.mjs
```

---

## Template Gallery

Pre-built, production-ready component templates:

| Category | Variants | Description |
|----------|----------|-------------|
| **Heroes** | centered, split, video-bg, animated, minimal | Full-screen landing sections |
| **Pricing** | comparison | 3-tier pricing table with feature lists |
| **Testimonials** | carousel | Quote carousel with avatar and navigation |
| **Features** | grid | 6-item card grid with icon, title, description |
| **Footers** | multi-column | Brand + link groups + copyright |
| **Navbars** | sticky | Logo, links, CTA, mobile hamburger menu |
| **CTAs** | banner | Full-width colored call-to-action |

See [docs/TEMPLATES.md](docs/TEMPLATES.md) for the full catalog.

---

## Interactive Pattern Library

Accessible, keyboard-navigable patterns for common interactive elements:

| Pattern | Key Features |
|---------|-------------|
| **Forms** | react-hook-form + zod validation, field-level errors, loading state, typed submit |
| **Modals** | Native `<dialog>`, focus trap, ESC/backdrop close, return focus on dismiss |
| **Tabs** | Arrow key navigation, Home/End, ARIA tablist/tab/tabpanel roles |
| **Carousels** | Touch/swipe, autoplay with pause, dot navigation, ARIA roledescription |
| **Accordions** | Single/multi expand, animated, keyboard accessible |
| **Dropdowns** | Arrow key navigation, outside click close, focus management, ARIA menu roles |

All patterns follow [WAI-ARIA authoring practices](https://www.w3.org/WAI/ARIA/apg/).

---

## Export Formats

| Format | Command | Description |
|--------|---------|-------------|
| **Next.js** | `morph clone <url>` | App Router, Server/Client Components, `generateMetadata()`, `loading.tsx` |
| **Vite + React** | `morph clone <url> -f vite-react` | React Router, standard React components, Vite config |
| **Astro** | `morph clone <url> -f astro` | `.astro` pages, React islands with `client:visible` |
| **Static HTML** | `morph clone <url> -f static-html` | Plain HTML files, Tailwind CDN, no build step |

---

## Development

```bash
# Install dependencies
npm install

# Install Playwright browser
npx playwright install chromium

# Start Next.js dev server
npm run dev

# Run tests
npm test

# Type check CLI code
npx tsc --noEmit --project tsconfig.cli.json

# Build CLI binary
npm run build:cli

# Full quality check
npm run check    # lint + typecheck + build
```

### Prerequisites

- **Node.js 24+** (see `.nvmrc`)
- **Chromium** — installed via `npx playwright install chromium`
- **sharp** — native binary, auto-installed on supported platforms

---

## Ethical Use

Morph is designed for legitimate use cases:

- **Platform migration** — rebuild a site you own from WordPress/Webflow/Squarespace into modern Next.js
- **Lost source code** — your site is live but the repo is gone, the developer left, or the stack is legacy
- **Learning** — deconstruct how production sites achieve specific layouts, animations, and responsive behavior

**Not intended for:**

- **Phishing or impersonation** — must not be used for deceptive purposes, impersonation, or any illegal activity
- **Passing off someone's design as your own** — logos, brand assets, and original copy belong to their owners
- **Violating terms of service** — some sites explicitly prohibit scraping or reproduction. Check first.

---

## License

MIT - see [LICENSE](LICENSE)
