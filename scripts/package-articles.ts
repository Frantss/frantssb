import { copyFile } from "node:fs/promises";
import { build } from "esbuild";

await copyFile(".generated/articles/catalogue.json", ".output/server/articles.json");
await build({
  entryPoints: ["scripts/articles-sync.ts"],
  outfile: ".output/server/articles-sync.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  external: ["pg"],
});
