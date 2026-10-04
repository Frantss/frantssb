import { sql } from "drizzle-orm";
import {
  check,
  customType,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({ dataType: () => "tsvector" });

export const articleCatalogues = pgTable(
  "article_catalogues",
  {
    revision: text("revision").primaryKey(),
    indexedAt: timestamp("indexed_at", { withTimezone: true }).notNull().defaultNow(),
    articleCount: integer("article_count").notNull(),
  },
  (table) => [check("article_catalogues_count_nonnegative", sql`${table.articleCount} >= 0`)],
);

export const articleIndex = pgTable(
  "article_index",
  {
    revision: text("revision")
      .notNull()
      .references(() => articleCatalogues.revision, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    publishedAt: date("published_at", { mode: "string" }).notNull(),
    tags: text("tags").array().notNull(),
    keywords: text("keywords").array().notNull(),
    language: text("language", { enum: ["en", "es"] }).notNull(),
    bodyText: text("body_text").notNull(),
    searchVector: tsvector("search_vector").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.revision, table.slug] }),
    check("article_index_language", sql`${table.language} in ('en', 'es')`),
    index("article_index_date").on(table.revision, table.publishedAt, table.slug),
    index("article_index_tags").using("gin", table.tags),
    index("article_index_search").using("gin", table.searchVector),
  ],
);

export const articleLikeCounts = pgTable(
  "article_like_counts",
  {
    articleSlug: text("article_slug").primaryKey(),
    count: integer("count").notNull().default(0),
  },
  (table) => [check("article_like_counts_count_nonnegative", sql`${table.count} >= 0`)],
);
