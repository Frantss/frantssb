import { openapi } from "@orpc/openapi";
import { articleLikes } from "@/shared/features/articles/article-likes.contract";

export const getArticleLikes = articleLikes.meta(
  openapi({ method: "GET", path: "/articles/{slug}/likes" }),
);
