import { defineConfig, lazyPlugins } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";
import { varlockVitePlugin } from "@varlock/vite-integration";
import tailwindcss from "@tailwindcss/vite";
import posthog from "@posthog/rollup-plugin";

import { tanstackStart } from "@tanstack/solid-start/plugin/vite";

import solidPlugin from "vite-plugin-solid";
import { nitro } from "nitro/vite";
import { cache_publicContent } from "./src/shared/cache-control";

const pages = ["/", "/work", "/projects", "/writing", "/writing/**"];

function posthogSourceMapsPlugin() {
  const personalApiKey = process.env.POSTHOG_API_KEY?.trim();
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim();
  if (!personalApiKey || !projectId) return;

  return Object.assign(
    posthog({
      personalApiKey,
      projectId,
      host: process.env.POSTHOG_HOST,
      sourcemaps: { deleteAfterUpload: true },
    }),
    {
      apply: "build" as const,
      applyToEnvironment: ({ name }: { name: string }) => name === "client",
    },
  );
}

export default defineConfig(({ mode }) => ({
  test: {
    fileParallelism: false,
    environment: "node",
    projects: [
      {
        test: {
          name: "node",
          include: ["src/shared/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "browser",
          include: ["src/client/**/*.test.{ts,tsx}"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
  fmt: { ignorePatterns: ["src/routeTree.gen.ts", "env.d.ts"] },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  resolve: { tsconfigPaths: true },
  plugins: lazyPlugins(() => [
    varlockVitePlugin({ ssrInjectMode: "init-only" }),
    tailwindcss(),
    tanstackStart({ server: { build: { inlineCss: true } } }),
    posthogSourceMapsPlugin(),
    ...(mode === "test"
      ? []
      : [
          nitro({
            preset: "node-server",
            prerender: { routes: ["/"], crawlLinks: true, failOnError: true },
            compressPublicAssets: { gzip: true, brotli: true },
            routeRules: Object.fromEntries(
              pages.map((page) => [page, { headers: { "cache-control": cache_publicContent } }]),
            ),
          }),
        ]),
    solidPlugin({ ssr: mode !== "test" }),
  ]),
}));
