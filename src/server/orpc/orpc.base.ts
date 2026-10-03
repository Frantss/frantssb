import "@tanstack/solid-start/server-only";
import { implement } from "@orpc/server";
import { contract } from "@/shared/orpc/orpc.contract";
import type { Context } from "@/server/orpc/orpc.context";

export const base = implement(contract).$context<Context>();
