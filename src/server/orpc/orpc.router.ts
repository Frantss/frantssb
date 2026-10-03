import "@tanstack/solid-start/server-only";
import { health } from "@/server/features/health/health.get";
import { getArticleLikes } from "@/server/features/articles/$slug/likes.get";
import { addArticleLike } from "@/server/features/articles/$slug/likes.post";

export const router = {
  health,
  articles: {
    likes: {
      get: getArticleLikes,
      add: addArticleLike,
    },
  },
};
