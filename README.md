# [frantssb](https://frantss.uy)

Personal website with an about page, work history, projects, and writing.

## Run locally

Requires Node.js, pnpm, and Docker running. Add this to `.env`:

```dotenv
DATABASE_URL=postgresql://frantssb:frantssb@localhost:5432/frantssb
```

```bash
pnpm install
pnpm db:up
pnpm db:migrate
pnpm articles:sync:dev
pnpm dev
```

Open [localhost:3000](http://localhost:3000). Other settings are optional;
see [`.env.schema`](.env.schema).

After editing articles, run `pnpm articles:sync:dev` to update local filtering
and search results.
