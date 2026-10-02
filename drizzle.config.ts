import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL is required. Set it in .env for local development (see .env.schema).",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/db.schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
