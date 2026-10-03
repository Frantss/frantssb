ALTER TABLE "post_like_counts" RENAME TO "article_like_counts";--> statement-breakpoint
ALTER TABLE "article_like_counts" RENAME COLUMN "post_slug" TO "article_slug";--> statement-breakpoint
ALTER TABLE "article_like_counts" RENAME CONSTRAINT "post_like_counts_count_nonnegative" TO "article_like_counts_count_nonnegative";