import * as v from "valibot";

export const rateLimitData = v.object({
  limit: v.pipe(v.number(), v.integer(), v.minValue(1)),
  remaining: v.pipe(v.number(), v.integer(), v.minValue(0)),
  reset: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
});

export const rateLimitErrors = { TOO_MANY_REQUESTS: { data: rateLimitData } };
