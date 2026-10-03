import "@tanstack/solid-start/server-only";
import { eq } from "drizzle-orm";
import { postLikeCounts } from "@/server/db/db.schema";
import { requirePost } from "@/server/features/posts/require-post";
import { base } from "@/server/orpc/orpc.base";

export const getPostLikes = base.posts.likes.get.handler(async ({ input, context }) => {
  requirePost(input.slug);
  const [counter] = await context.db
    .select({ count: postLikeCounts.count })
    .from(postLikeCounts)
    .where(eq(postLikeCounts.postSlug, input.slug));

  return { count: counter?.count ?? 0 };
});
