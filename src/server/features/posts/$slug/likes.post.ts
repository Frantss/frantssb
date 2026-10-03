import "@tanstack/solid-start/server-only";
import { sql } from "drizzle-orm";
import { postLikeCounts } from "@/server/db/db.schema";
import { requirePost } from "@/server/features/posts/require-post";
import { base } from "@/server/orpc/orpc.base";

export const addPostLike = base.posts.likes.add.handler(async ({ input, context }) => {
  requirePost(input.slug);
  const [counter] = await context.db
    .insert(postLikeCounts)
    .values({ postSlug: input.slug, count: 1 })
    .onConflictDoUpdate({
      target: postLikeCounts.postSlug,
      set: { count: sql`${postLikeCounts.count} + 1` },
    })
    .returning({ count: postLikeCounts.count });

  return counter;
});
