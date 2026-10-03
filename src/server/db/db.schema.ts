import { sql } from "drizzle-orm";
import { check, integer, pgTable, text } from "drizzle-orm/pg-core";

export const postLikeCounts = pgTable(
  "post_like_counts",
  {
    postSlug: text("post_slug").primaryKey(),
    count: integer("count").notNull().default(0),
  },
  (table) => [check("post_like_counts_count_nonnegative", sql`${table.count} >= 0`)],
);
