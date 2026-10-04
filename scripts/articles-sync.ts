import { readFile } from "node:fs/promises";
import { drizzle } from "drizzle-orm/node-postgres";
import { article_syncIndex } from "@/server/features/articles/article-index";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const db = drizzle({ connection: { connectionString: process.env.DATABASE_URL } });
try {
  const path = process.argv[2] ?? new URL("./articles.json", import.meta.url);
  const manifest: unknown = JSON.parse(await readFile(path, "utf8"));
  const result = await article_syncIndex(db, manifest);
  console.log(
    `Article catalogue ${result.revision}: ${result.inserted ? "indexed" : "already indexed"}.`,
  );
} finally {
  await db.$client.end();
}
