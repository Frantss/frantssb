import { fileURLToPath } from "node:url";
import type { PluginOption } from "vite-plus";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import { createHighlighter } from "@tanstack/highlight/core";
import { css } from "@tanstack/highlight/languages/css";
import { html } from "@tanstack/highlight/languages/html";
import { js } from "@tanstack/highlight/languages/js";
import { json } from "@tanstack/highlight/languages/json";
import { shell } from "@tanstack/highlight/languages/shell";
import { ts } from "@tanstack/highlight/languages/ts";
import { tsx } from "@tanstack/highlight/languages/tsx";
import { rehypeHighlightCodeBlocks } from "@tanstack/highlight/rehype";
import { createThemeCss, themeTokenClasses, type HighlightTheme } from "@tanstack/highlight/theme";
import { githubLightTheme } from "@tanstack/highlight/themes/github-light";
import { githubDarkTheme } from "@tanstack/highlight/themes/github-dark";
import { tsImport } from "tsx/esm/api";

const { article_generate } = (await tsImport(
  "@/lib/articles/article-generate",
  import.meta.url,
)) as typeof import("@/lib/articles/article-generate");
let generation: ReturnType<typeof article_generate> | undefined;
const generate = () => (generation ??= article_generate());
const metadataId = "virtual:article-metadata";
const resolvedMetadataId = `\0${metadataId}`;
const articleDirectory = fileURLToPath(new URL("./src/content/articles/", import.meta.url));

const highlighter = createHighlighter({ languages: [css, html, js, json, shell, ts, tsx] });
const theme: HighlightTheme = { ...githubLightTheme, tokens: { ...githubLightTheme.tokens } };

theme.background = `light-dark(${githubLightTheme.background}, ${githubDarkTheme.background})`;
for (const token of themeTokenClasses) {
  theme.tokens[token] =
    `light-dark(${githubLightTheme.tokens[token]}, ${githubDarkTheme.tokens[token]})`;
}

const themeId = "virtual:highlight.css";
const resolvedThemeId = `\0${themeId}`;
const compiler = mdx({
  jsx: true,
  jsxImportSource: "solid-js",
  providerImportSource: fileURLToPath(new URL("./src/content/mdx-components.tsx", import.meta.url)),
  remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
  rehypePlugins: [[rehypeHighlightCodeBlocks, { highlighter }]],
});

export const mdxPlugins: PluginOption[] = [
  {
    name: "article-metadata",
    enforce: "pre",
    resolveId(id) {
      if (id === metadataId) return resolvedMetadataId;
    },
    async load(id) {
      if (id !== resolvedMetadataId) return;
      const { metadata } = await generate();

      return `export default ${JSON.stringify(metadata)}`;
    },
    configureServer(server) {
      let refresh = Promise.resolve();

      server.watcher.add(articleDirectory);
      server.watcher.on("all", (_event, path) => {
        if (!path.startsWith(articleDirectory) || !/\.(md|mdx)$/.test(path)) return;
        refresh = refresh
          .then(async () => {
            await generation?.catch(() => undefined);
            generation = undefined;
            await generate();
            for (const environment of Object.values(server.environments)) {
              environment.moduleGraph.invalidateAll();
              environment.hot.send({ type: "full-reload" });
            }
          })
          .catch((error) => {
            server.config.logger.error(String(error));
          });
      });
    },
  },
  {
    ...compiler,
    enforce: "pre",
    transform(code, id) {
      if (id === resolvedMetadataId) return;

      return compiler.transform(code, id);
    },
  },
  {
    name: "highlight-theme",
    resolveId(id) {
      if (id === themeId) return resolvedThemeId;
    },
    load(id) {
      if (id === resolvedThemeId) {
        return createThemeCss({
          light: theme,
          lightSelector: ".article-body",
          codeBlockSelector: ".article-body pre.th-code",
        });
      }
    },
  },
];
