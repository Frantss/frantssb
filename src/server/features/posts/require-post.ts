import "@tanstack/solid-start/server-only";
import { ORPCError } from "@orpc/server";
import { locales } from "@/paraglide/runtime";
import { writing_posts } from "@/shared/features/writing/writing.data";

export function requirePost(slug: string) {
  if (!locales.some((locale) => writing_posts(locale).some((post) => post.slug === slug))) {
    throw new ORPCError("NOT_FOUND", { message: "Post not found" });
  }
}
