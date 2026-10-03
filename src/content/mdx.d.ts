declare module "virtual:highlight.css";

declare module "*.mdx" {
  import type { Component } from "solid-js";

  export const frontmatter: unknown;
  const Content: Component;
  export default Content;
}

declare module "*.md" {
  import type { Component } from "solid-js";

  export const frontmatter: unknown;
  const Content: Component;
  export default Content;
}
