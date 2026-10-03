import { afterEach, describe, expect, it } from "vite-plus/test";
import { render } from "solid-js/web";
import Placeholder, { frontmatter } from "@/content/posts/hello-world.mdx";
import { posts } from "@/content/posts";

let dispose: (() => void) | undefined;
afterEach(() => dispose?.());

describe("MDX articles", () => {
  it("discovers frontmatter as serializable post metadata", () => {
    expect(posts.find((post) => post.slug === "hello-world")).toEqual({
      slug: "hello-world",
      ...(frontmatter as Record<string, unknown>),
    });
    expect(JSON.parse(JSON.stringify(posts))).toEqual(posts);
  });

  it("compiles Markdown, JSX, and highlighted code into Solid elements", () => {
    const container = document.createElement("div");
    document.body.append(container);
    const stop = render(() => <Placeholder />, container);
    dispose = () => {
      stop();
      container.remove();
    };

    expect(container.querySelector("h2")?.textContent).toBe("Writing in Markdown");
    expect(container.querySelectorAll("li")).toHaveLength(3);
    expect(container.textContent).toContain("A little JSX works here too: 4.");
    expect(container.querySelector("time")?.dateTime).toBe("2026-10-03");
    expect(container.querySelector('pre[data-language="tsx"] .th-keyword')?.textContent).toBe(
      "export",
    );
    expect(container.querySelector(".th-line--highlighted")?.textContent).toContain(
      "return <p>Hello from Solid.</p>;",
    );
    expect(container.querySelector(".th-code--line-numbers")).not.toBeNull();
    expect(container.querySelector('pre[data-language="shell"] code')?.textContent).toContain(
      "pnpm dev",
    );
  });
});
