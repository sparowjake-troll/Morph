# Morph CLI Reference

## Installation

```bash
npm install -g morph
# or use directly
npx morph <command>
```

## Commands

### `morph clone <urls...>`

Full clone pipeline — extract, generate, and audit.

```bash
morph clone https://example.com
morph clone https://example.com https://example.com/about --depth 2
morph clone https://example.com -f vite-react -o ./output
```

**Options:**
| Flag | Description | Default |
|------|-------------|---------|
| `-c, --config <path>` | Path to morph.config.ts | Auto-discovered |
| `-o, --output <dir>` | Output directory | `.` |
| `-f, --framework <type>` | Output framework | `nextjs` |
| `-d, --depth <n>` | Max crawl depth | `1` |
| `--skip-audit` | Skip quality audit step | `false` |
| `--skip-assets` | Skip asset download | `false` |
| `--viewports <list>` | Comma-separated viewport names | All configured |
| `--incremental` | Only regenerate changed sections | `false` |

### `morph extract <url>`

Extract design tokens, assets, and analysis without generating code.

```bash
morph extract https://example.com
morph extract https://example.com --tokens-only
morph extract https://example.com --assets-only -o ./extracted
```

**Options:**
| Flag | Description | Default |
|------|-------------|---------|
| `-c, --config <path>` | Path to morph.config.ts | Auto-discovered |
| `-o, --output <dir>` | Output directory | `.` |
| `--tokens-only` | Only extract design tokens | `false` |
| `--assets-only` | Only download assets | `false` |

**Outputs:**
- `docs/research/design-tokens.json` — Full token report
- `src/app/globals.css` — Updated with extracted tokens
- `docs/research/animation-inventory.json` — Animation analysis
- `docs/research/interaction-map.json` — Interaction map
- `public/images/`, `public/fonts/` — Downloaded assets

### `morph audit [dir]`

Run quality audit on a clone.

```bash
morph audit
morph audit ./output --original-url https://example.com --clone-url http://localhost:3000
morph audit --lighthouse-only
morph audit --a11y-only
```

**Options:**
| Flag | Description | Default |
|------|-------------|---------|
| `-c, --config <path>` | Path to morph.config.ts | Auto-discovered |
| `--original-url <url>` | Original site URL for visual regression | - |
| `--clone-url <url>` | Local clone URL for visual regression | - |
| `--lighthouse-only` | Run only Lighthouse audit | `false` |
| `--a11y-only` | Run only accessibility audit | `false` |
| `--visual-only` | Run only visual regression | `false` |

### `morph optimize [dir]`

Optimize images and SVGs in a directory.

```bash
morph optimize public/
morph optimize public/ -q 90 --formats webp,avif
morph optimize public/ --max-width 1920
```

**Options:**
| Flag | Description | Default |
|------|-------------|---------|
| `-c, --config <path>` | Path to morph.config.ts | Auto-discovered |
| `-q, --quality <n>` | Image quality (1-100) | `80` |
| `--formats <list>` | Output formats | `webp,original` |
| `--max-width <n>` | Max image width in pixels | `2560` |
