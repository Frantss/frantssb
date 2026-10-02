import { defineConfig, lazyPlugins } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";
import { varlockVitePlugin } from "@varlock/vite-integration";
import tailwindcss from "@tailwindcss/vite";

import { tanstackStart } from "@tanstack/solid-start/plugin/vite";

import solidPlugin from "vite-plugin-solid";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => ({
  test: {
    fileParallelism: false,
    environment: "node",
    projects: [
      {
        test: {
          name: "node",
          include: ["src/server/**/*.test.ts", "src/shared/**/*.test.ts"],
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
    tanstackStart(),
    ...(mode === "test" ? [] : [nitro({ preset: "node-server" })]),
    solidPlugin({ ssr: mode !== "test" }),
  ]),
}));
