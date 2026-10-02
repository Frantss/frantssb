# Railway deployment

The [frantssb project](https://railway.com/project/b62c5679-8957-453d-b785-795045a745e2)
contains the `frantssb` app and `Postgres` database in `production`.
`.railway/railway.ts` manages their configuration, including the existing
PostgreSQL volume. Database credentials stay in Railway; the app uses a service
variable reference.

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

Deploy local source:

```sh
railway up --service frantssb --environment production --detach -m "deploy frantssb"
railway deployment list --service frantssb --environment production --json
railway logs --service frantssb --environment production --lines 100
```

Wait for `SUCCESS` in the deployment list. `/api/health` returns
`{"status":"ok"}` when the server is running; it does not check the database.

There is no Git remote, so deployments use the local checkout. No automatic
GitHub deployment is configured. There are no database migrations yet, so the
service has no pre-deploy migration command.
