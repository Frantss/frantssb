import "@tanstack/solid-start/server-only";
import { health } from "@/server/features/health/health.get";
import { getArticles } from "@/server/features/articles/articles.get";
import { getArticleLikes } from "@/server/features/articles/$slug/likes.get";
import { addArticleLike } from "@/server/features/articles/$slug/likes.post";

export const router = {
  health,
  articles: {
    get: getArticles,
    likes: {
      get: getArticleLikes,
      add: addArticleLike,
    },
  },
};
