# Railway deployment

The [frantssb project](https://railway.com/project/b62c5679-8957-453d-b785-795045a745e2)
hosts the `frantssb` app in `production`.
`.railway/railway.ts` manages the app configuration. The site uses TanStack Start
SSR, an oRPC API, and PostgreSQL through Drizzle.

Use Railway CLI 5.42.1 or newer and the repo's pnpm 12.8.1. Install dependencies
with `pnpm install`; the `railway` SDK is a development dependency.

Link another checkout:

```sh
railway link --project b62c5679-8957-453d-b785-795045a745e2 --environment production --service frantssb
```

Review and apply infrastructure changes:

```sh
railway config plan
railway config apply
```

The CLI evaluates `.railway/railway.ts`; uploading source does not apply it.
Review every plan because removing a resource from the file can delete it in
Railway.

The configuration includes `Postgres` and supplies its private `DATABASE_URL`
to the app. Apply the reviewed configuration before deploying source that
requires the database. The previously retained `postgres-volume` remains
declared separately; review its attachment in the plan before applying.

Drizzle commands are `pnpm db:generate`, `pnpm db:migrate`, and `pnpm db:studio`.
Table definitions belong in `src/server/db/db.schema.ts`; migrations are written
to `drizzle/`. No application tables are defined yet. Run migrations with a
database URL reachable from the machine executing the command.

Deploy local source:

```sh
railway up --service frantssb --environment production --detach -m "deploy frantssb"
railway deployment list --service frantssb --environment production --json
railway logs --service frantssb --environment production --lines 100
```

Wait for `SUCCESS` in the deployment list. Railway checks `/` for HTTP 200.
Browser analytics use `VITE_POSTHOG_HOST` directly; set it to the PostHog
ingestion host instead of the removed `/api/angry-ankylosaurus` proxy.

There is no Git remote, so deployments use the local checkout. No automatic
GitHub deployment is configured.
