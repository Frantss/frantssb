import "@tanstack/solid-start/server-only";
import { implement } from "@orpc/server";
import { contract } from "@/shared/orpc/orpc.contract";
import type { Context } from "@/server/orpc/orpc.context";

const base = implement(contract).$context<Context>();

export const router = {
  health: base.health.handler(() => ({ status: "ok" })),
};
