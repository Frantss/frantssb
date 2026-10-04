import "@tanstack/solid-start/server-only";
import { os } from "@orpc/server";
import { ratelimit } from "@orpc/ratelimit";
import { MemoryRateLimiter, type MemoryRateLimiterOptions } from "@orpc/ratelimit/memory";
import type { Context } from "@/server/orpc/orpc.context";

export function api_rateLimit(options: MemoryRateLimiterOptions) {
  const limiter = new MemoryRateLimiter(options);
  const check = ratelimit<Pick<Context, "clientIP">, unknown>({
    limiter,
    key: ({ context }) => context.clientIP ?? "unknown",
  });

  return os.$context<Pick<Context, "clientIP">>().middleware((options, input, done) => {
    if (options.context.clientIP === undefined) return options.next();

    return check(options, input, done);
  });
}

export const api_rateLimits = {
  search: api_rateLimit({ maxRequests: 60, window: 60_000 }),
  likesRead: api_rateLimit({ maxRequests: 240, window: 60_000 }),
  likesWriteBurst: api_rateLimit({ maxRequests: 30, window: 10_000 }),
  likesWrite: api_rateLimit({ maxRequests: 120, window: 60_000 }),
};
