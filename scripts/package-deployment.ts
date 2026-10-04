import { copyFile, cp } from "node:fs/promises";
import { Rolldown } from "vite-plus/pack";

await copyFile(".generated/articles/catalogue.json", ".output/server/articles.json");
await copyFile(".env.schema", ".output/.env.schema");
await cp("node_modules/varlock", ".output/varlock", { recursive: true, dereference: true });
await Rolldown.build({
  input: "scripts/articles-sync.ts",
  platform: "node",
  tsconfig: "tsconfig.json",
  output: {
    file: ".output/server/articles-sync.mjs",
    format: "esm",
  },
});
