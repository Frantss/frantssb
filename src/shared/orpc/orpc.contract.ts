import { health } from "@/shared/features/health/health.get.contract";
import { getArticles } from "@/shared/features/articles/articles.get.contract";
import { getArticleLikes } from "@/shared/features/articles/$slug/likes.get.contract";
import { addArticleLike } from "@/shared/features/articles/$slug/likes.post.contract";

export const contract = {
  health,
  articles: {
    get: getArticles,
    likes: {
      get: getArticleLikes,
      add: addArticleLike,
    },
  },
};
