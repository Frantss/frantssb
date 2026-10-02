# frantssb

TanStack Start project using Solid 1, Tailwind CSS 4, and Vite+.

Keep Solid on 1.x, its TanStack integrations on compatible 1.x releases, and vite-plugin-solid on 2.x when updating dependencies.

## Source layout

- `src/client/`: presentation, analytics, and styles. UI still renders during SSR.
- `src/server/`: database access and analytics proxy.
- `src/shared/`: environment-independent constants, validation, and SEO.
- `src/routes/`: thin TanStack route adapters; generated routing stays at the source root.

Client modules do not import server modules. Shared modules import neither client
nor server code.

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
to inspect redacted resolved values. `DATABASE_URL` is required for the app and build. PostHog settings are optional; browser code uses the
`VITE_POSTHOG_*` values, while the database URL and PostHog API key stay
sensitive. Varlock generates `env.d.ts` from the schema.

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

## PostHog

The shared adapter in `src/client/posthog/posthog.ts` loads the slim
`posthog-js` entry after browser mount in production builds only. Development,
SSR, and builds with missing settings do not initialize the SDK.

| Variable                   | Value                                                        |
| -------------------------- | ------------------------------------------------------------ |
| `VITE_POSTHOG_KEY`         | Public project token (`phc_…`)                               |
| `VITE_POSTHOG_HOST`        | `/api/angry-ankylosaurus` for the same-origin US Cloud proxy |
| `VITE_POSTHOG_PERSISTENCE` | `localStorage+cookie` or `memory`; empty disables analytics  |
| `POSTHOG_HOST`             | `https://us.i.posthog.com` for server ingestion              |

`/api/angry-ankylosaurus/*` proxies to PostHog's US hosts, stripping cookies and
authorization headers. Server code uses `analytics_capture` from
`@/server/analytics/analytics` and `errors_capture` from `@/server/errors/errors`;
both return `false` instead of failing when PostHog is unavailable. Browser code
uses `analytics_capture`, `analytics_defineEvent`, and `analytics_autocapture`
from `@/client/analytics/analytics`, and `errors_capture` from
`@/client/errors/errors`.
