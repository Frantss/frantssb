import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import * as v from "@/shared/validation/valibot";

// Public procedures only: the browser client bundles this contract on every page.
export const contract = {
  health: oc
    .meta(openapi({ method: "GET", path: "/health" }))
    .output(v.object({ status: v.literal("ok") })),
};
