# frantssb

TanStack Start project using Solid 1, Tailwind CSS 4, and Vite+.

Keep Solid on 1.x, its TanStack integrations on compatible 1.x releases, and vite-plugin-solid on 2.x when updating dependencies.

## Source layout

- `src/client/`: presentation and styles. UI still renders during SSR.
- `src/routes/`: thin TanStack route adapters; generated routing stays at the source root.

Feature code goes in `src/<side>/features/<feature>/`. Use at most one generic dot
scope (`<feature>.form.ts`, `<feature>.schema.ts`, `<feature>.data.ts`,
`<component>.context.ts`); descriptive names use hyphens. Tests live in the owning
module's `tests/` folder (`tests/<name>.test.ts`).

Use `@/` for imports rooted at `src`. The alias is defined in `tsconfig.json` and
resolved by Vite's `resolve.tsconfigPaths` setting.

## Development

```bash
pnpm install
pnpm dev
```

The development server runs at `http://localhost:3000`.

## Commands

Vitest runs client tests in headless Chromium through Playwright and server and
shared tests in Node. Install Chromium once per machine:

```bash
pnpm exec playwright install chromium
```

```bash
pnpm check
pnpm test
pnpm build
pnpm start
```

Routes live in `src/routes`. TanStack Router generates `src/routeTree.gen.ts`; do
not edit or format that file manually.
