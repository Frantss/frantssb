import { oc } from "@orpc/contract";
import * as v from "valibot";

export const articleLikes = oc
  .input(v.object({ slug: v.pipe(v.string(), v.minLength(1)) }))
  .output(v.object({ count: v.pipe(v.number(), v.integer(), v.minValue(0)) }))
  .errors({ NOT_FOUND: { message: "Article not found" } });
