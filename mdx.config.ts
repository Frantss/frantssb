import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
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

const { article_parseFrontmatter } = (await tsImport(
  "@/lib/articles/article-frontmatter",
  import.meta.url,
)) as typeof import("@/lib/articles/article-frontmatter");
const { article_generateSocialImage } = (await tsImport(
  "@/lib/articles/article-social-image",
  import.meta.url,
)) as typeof import("@/lib/articles/article-social-image");

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
    name: "mdx-frontmatter",
    enforce: "pre",
    async load(id) {
      if (!id.endsWith("?frontmatter")) return;
      const path = id.slice(0, -"?frontmatter".length);
      const source = await readFile(path, "utf8");
      const frontmatter = article_parseFrontmatter(source, path);
      const socialImage = await article_generateSocialImage(
        frontmatter,
        basename(path).replace(/\.(md|mdx)$/, ""),
      );
      return `export default ${JSON.stringify({ ...frontmatter, socialImage })}`;
    },
  },
  {
    ...compiler,
    enforce: "pre",
    transform(code, id) {
      // The MDX plugin strips queries before checking extensions, including metadata-only imports.
      if (id.endsWith("?frontmatter")) return;
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
