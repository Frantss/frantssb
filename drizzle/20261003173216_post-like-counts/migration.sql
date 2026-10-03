CREATE TABLE "post_like_counts" (
	"post_slug" text PRIMARY KEY,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "post_like_counts_count_nonnegative" CHECK ("count" >= 0)
);
