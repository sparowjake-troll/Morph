# Contributing to Morph

## Development Setup

```bash
git clone https://github.com/mikulgohil/Morph.git
cd Morph
npm install
npx playwright install chromium
```

## Architecture

```
src/
  cli/          → CLI commands and utilities
  config/       → Zod config schema and defaults
  core/         → Shared types, errors, constants
  extraction/   → Browser automation and data extraction
  generation/   → Code generation (routes, components, templates)
  quality/      → Audit and visual regression
  incremental/  → Change detection and selective regeneration
  figma/        → Figma API integration
```

## Adding a New Extractor

1. Create a file in `src/extraction/<category>/<name>.ts`
2. Export an async function that takes a Playwright `Page` and returns typed data
3. Add the return type to `src/core/types.ts`
4. Wire it into the relevant CLI command in `src/cli/commands/`
5. Add tests in `tests/unit/extraction/`

## Adding a New Pattern

1. Create `src/generation/patterns/<name>.ts`
2. Export a `generate<Name>Pattern(config)` function that returns a component string
3. Register it in `src/generation/patterns/index.ts`
4. Add a `<Name>PatternConfig` interface

## Adding a New Template

1. Create `src/generation/templates/<category>/<variant>.tsx`
2. Export a React component with a `Props` interface
3. Register in `src/generation/templates/index.ts`
4. Document in `docs/TEMPLATES.md`

## Adding a New Export Adapter

1. Create `src/generation/adapters/<name>.ts`
2. Implement the `OutputAdapter` interface from `./types.ts`
3. Add the adapter name to the `framework` enum in `src/config/schema.ts`

## Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## Code Style

- TypeScript strict mode — no `any`
- Named exports, PascalCase components
- Tailwind utility classes only
- 2-space indentation
