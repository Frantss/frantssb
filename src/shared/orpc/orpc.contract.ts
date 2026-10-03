import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import * as v from "valibot";

const articleLikes = oc
  .input(v.object({ slug: v.pipe(v.string(), v.minLength(1)) }))
  .output(v.object({ count: v.pipe(v.number(), v.integer(), v.minValue(0)) }))
  .errors({ NOT_FOUND: { message: "Article not found" } });

export const contract = {
  health: oc
    .meta(openapi({ method: "GET", path: "/health" }))
    .output(v.object({ status: v.literal("ok") })),
  articles: {
    likes: {
      get: articleLikes.meta(openapi({ method: "GET", path: "/articles/{slug}/likes" })),
      add: articleLikes.meta(openapi({ method: "POST", path: "/articles/{slug}/likes" })),
    },
  },
};
