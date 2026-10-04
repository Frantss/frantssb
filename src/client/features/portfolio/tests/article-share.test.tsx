import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { ArticleShare } from "@/client/features/portfolio/article-share";
import { analytics_capture } from "@/client/analytics/analytics";
import type { Article } from "@/lib/articles/article-metadata";
import { setLocale } from "@/paraglide/runtime";

vi.mock("@/client/analytics/analytics", () => ({ analytics_capture: vi.fn() }));

const article = {
  slug: "log-001",
  title: "Log 001",
  description: "Enough to start.",
} as Article;

let dispose: (() => void) | undefined;

function mount(ui: () => JSX.Element) {
  const container = document.createElement("div");

  document.body.append(container);
  const stop = render(ui, container);

  dispose = () => {
    stop();
    container.remove();
  };

  return container;
}

beforeEach(async () => {
  await setLocale("en", { reload: false });
});

afterEach(() => {
  dispose?.();
  vi.restoreAllMocks();
  vi.mocked(analytics_capture).mockClear();
});

describe("ArticleShare", () => {
  it("copies the canonical article URL", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const container = mount(() => <ArticleShare article={article} />);
    const button = container.querySelector("button")!;

    expect(button.getAttribute("aria-label")).toBe("Copy link");

    button.click();

    await expect
      .poll(() => container.querySelector('[role="status"]')?.textContent)
      .toBe("Link copied");
    expect(writeText).toHaveBeenCalledWith("https://frantss.uy/writing/log-001");
    expect(analytics_capture).toHaveBeenCalledWith("article_shared", {
      article_slug: "log-001",
      locale: "en",
      method: "copy",
    });
  });

  it("announces when copying fails", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    const container = mount(() => <ArticleShare article={article} />);

    container.querySelector("button")!.click();

    await expect
      .poll(() => container.querySelector('[role="status"]')?.textContent)
      .toBe("Couldn't copy the link");
    expect(analytics_capture).not.toHaveBeenCalled();
  });
});
