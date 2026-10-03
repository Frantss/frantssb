import "@tanstack/solid-start/server-only";
import { health } from "@/server/features/health/health.get";
import { getPostLikes } from "@/server/features/posts/$slug/likes.get";
import { addPostLike } from "@/server/features/posts/$slug/likes.post";

export const router = {
  health,
  posts: {
    likes: {
      get: getPostLikes,
      add: addPostLike,
    },
  },
};
