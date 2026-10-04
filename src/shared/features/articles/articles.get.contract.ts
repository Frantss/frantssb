import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import * as v from "valibot";
import { rateLimitErrors } from "@/shared/orpc/orpc-errors.contract";

const queryInteger = v.pipe(
  v.union([v.number(), v.pipe(v.string(), v.regex(/^\d+$/), v.toNumber())]),
  v.safeInteger(),
  v.minValue(0),
);

export const article_querySchema = v.object({
  tag: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100))),
  q: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(200))),
  limit: v.optional(v.pipe(queryInteger, v.minValue(1), v.maxValue(100)), 20),
  offset: v.optional(queryInteger, 0),
});

export const getArticles = oc
  .meta(openapi({ method: "GET", path: "/articles" }))
  .input(article_querySchema)
  .output(
    v.object({
      items: v.array(
        v.object({
          slug: v.string(),
          title: v.string(),
          description: v.string(),
          date: v.string(),
          tags: v.array(v.string()),
        }),
      ),
      total: v.pipe(v.number(), v.integer(), v.minValue(0)),
    }),
  )
  .errors({
    ...rateLimitErrors,
    SERVICE_UNAVAILABLE: { message: "Article catalogue not indexed" },
  });
