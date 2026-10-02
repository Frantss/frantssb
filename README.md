# [frantssb](https://frantss.uy)

Personal website with an about page, work history, projects, and writing.

## Run locally

Requires Node.js, pnpm, and Docker running.

```bash
pnpm install
echo 'DATABASE_URL=postgresql://frantssb:frantssb@localhost:5432/frantssb' > .env
pnpm db:up
pnpm dev
```

Open [localhost:3000](http://localhost:3000). If `.env` already exists, add or
update `DATABASE_URL` instead of overwriting it. Other settings are optional;
see [`.env.schema`](.env.schema).
