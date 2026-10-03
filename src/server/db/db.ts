import "@tanstack/solid-start/server-only";
import { drizzle } from "drizzle-orm/node-postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required. Set it in .env for local development (see .env.schema).",
  );
}

export const db = drizzle({ connection: { connectionString } });

if (import.meta.hot) {
  import.meta.hot.dispose(() => db.$client.end());
}
