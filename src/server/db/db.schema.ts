import { sql } from "drizzle-orm";
import { check, integer, pgTable, text } from "drizzle-orm/pg-core";

export const articleLikeCounts = pgTable(
  "article_like_counts",
  {
    articleSlug: text("article_slug").primaryKey(),
    count: integer("count").notNull().default(0),
  },
  (table) => [check("article_like_counts_count_nonnegative", sql`${table.count} >= 0`)],
);
