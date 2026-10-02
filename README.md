# frantssb

TanStack Start project using Solid 1, Tailwind CSS 4, and Vite+.

Keep Solid on 1.x, its TanStack integrations on compatible 1.x releases, and vite-plugin-solid on 2.x when updating dependencies.

## Source layout

- `src/client/`: presentation and styles. UI still renders during SSR.
- `src/server/`: database access.
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
echo 'DATABASE_URL=postgresql://frantssb:frantssb@localhost:5432/frantssb' > .env
pnpm dev
```

`.env.schema` documents every variable; only `DATABASE_URL` is required.

The development server runs at `http://localhost:3000`.

Varlock reads `.env.schema` and validates variables when the app starts or builds.
`APP_ENV` (default `development`) selects an env-specific file: Varlock loads
`.env.[APP_ENV]` and `.env.[APP_ENV].local` after `.env` and `.env.local`, and
process environment variables override all files.
Keep local values in the ignored `.env` file; use `pnpm exec varlock load --agent`
to inspect redacted resolved values. `DATABASE_URL` is required for the app and build. Varlock generates `env.d.ts` from the schema.

## Database

Drizzle ORM and Drizzle Kit are pinned to `1.0.0-rc.4`, using the `pg` driver.
Docker Compose runs PostgreSQL 18 locally with a health check and persistent volume.

```bash
pnpm db:up
pnpm db:migrate
```

Docker must be running. PostgreSQL listens on `127.0.0.1:5432`; the credentials
in `compose.yaml` and the `DATABASE_URL` above are for local development only.

Import `db` from `@/server/db/db` in server code. The module is guarded against
client imports and closes its connection pool when replaced during development.
Define application tables in `src/server/db/db.schema.ts`, then generate and
apply migrations:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

There are no migrations yet. Commit generated files in `drizzle/` with their
schema changes. Migrations run explicitly, not on
application startup. `pnpm db:down` stops the database and retains its volume.

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

`pnpm check` and `pnpm test` set `APP_ENV=test`, so Varlock loads the committed
`.env.test`, which supplies an unreachable `DATABASE_URL`.

Routes live in `src/routes`. TanStack Router generates `src/routeTree.gen.ts`; do
not edit or format that file manually.
