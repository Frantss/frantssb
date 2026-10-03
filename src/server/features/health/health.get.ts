import "@tanstack/solid-start/server-only";
import { base } from "@/server/orpc/orpc.base";

export const health = base.health.handler(() => ({ status: "ok" }));
