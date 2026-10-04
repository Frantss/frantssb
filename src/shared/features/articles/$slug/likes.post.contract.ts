import { openapi } from "@orpc/openapi";
import { articleLikes } from "@/shared/features/articles/article-likes.contract";

export const addArticleLike = articleLikes.meta(
  openapi({ method: "POST", path: "/articles/{slug}/likes" }),
);
