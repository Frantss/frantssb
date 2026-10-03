import type { JSX } from "solid-js";
import { Dynamic } from "solid-js/web";

const tags = [
  "a",
  "blockquote",
  "br",
  "code",
  "del",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "input",
  "li",
  "ol",
  "p",
  "pre",
  "section",
  "span",
  "strong",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
] as const;

// MDX emits member expressions for HTML tags, which Solid compiles as component calls.
const components = Object.fromEntries(
  tags.map((tag) => [
    tag,
    (props: JSX.HTMLAttributes<HTMLElement>) => <Dynamic component={tag} {...props} />,
  ]),
);

export function useMDXComponents() {
  return components;
}
