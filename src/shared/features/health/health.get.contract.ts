import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import * as v from "valibot";

export const health = oc
  .meta(openapi({ method: "GET", path: "/health" }))
  .output(v.object({ status: v.literal("ok") }));
