CREATE TABLE "article_catalogues" (
	"revision" text PRIMARY KEY,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"article_count" integer NOT NULL,
	CONSTRAINT "article_catalogues_count_nonnegative" CHECK ("article_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "article_index" (
	"revision" text,
	"slug" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"published_at" date NOT NULL,
	"tags" text[] NOT NULL,
	"keywords" text[] NOT NULL,
	"language" text NOT NULL,
	"body_text" text NOT NULL,
	"search_vector" tsvector NOT NULL,
	CONSTRAINT "article_index_pkey" PRIMARY KEY("revision","slug"),
	CONSTRAINT "article_index_language" CHECK ("language" in ('en', 'es'))
);
--> statement-breakpoint
CREATE INDEX "article_index_date" ON "article_index" ("revision","published_at","slug");--> statement-breakpoint
CREATE INDEX "article_index_tags" ON "article_index" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "article_index_search" ON "article_index" USING gin ("search_vector");--> statement-breakpoint
ALTER TABLE "article_index" ADD CONSTRAINT "article_index_revision_article_catalogues_revision_fkey" FOREIGN KEY ("revision") REFERENCES "article_catalogues"("revision") ON DELETE CASCADE;