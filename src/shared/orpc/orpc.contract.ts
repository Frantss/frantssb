import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import * as v from "valibot";

const postLikes = oc
  .input(v.object({ slug: v.pipe(v.string(), v.minLength(1)) }))
  .output(v.object({ count: v.pipe(v.number(), v.integer(), v.minValue(0)) }))
  .errors({ NOT_FOUND: { message: "Post not found" } });

export const contract = {
  health: oc
    .meta(openapi({ method: "GET", path: "/health" }))
    .output(v.object({ status: v.literal("ok") })),
  posts: {
    likes: {
      get: postLikes.meta(openapi({ method: "GET", path: "/posts/{slug}/likes" })),
      add: postLikes.meta(openapi({ method: "POST", path: "/posts/{slug}/likes" })),
    },
  },
};
