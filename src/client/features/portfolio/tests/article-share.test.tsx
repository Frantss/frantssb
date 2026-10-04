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

function stubShare(share: ((data: ShareData) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, "share", { configurable: true, value: share });
}

beforeEach(async () => {
  await setLocale("en", { reload: false });
});

afterEach(() => {
  dispose?.();
  stubShare(undefined);
  vi.restoreAllMocks();
  vi.mocked(analytics_capture).mockClear();
});

describe("ArticleShare", () => {
  it("copies the canonical article URL when the share sheet is unavailable", async () => {
    stubShare(undefined);
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
    stubShare(undefined);
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    const container = mount(() => <ArticleShare article={article} />);

    container.querySelector("button")!.click();

    await expect
      .poll(() => container.querySelector('[role="status"]')?.textContent)
      .toBe("Couldn't copy the link");
    expect(analytics_capture).not.toHaveBeenCalled();
  });

  it("opens the share sheet with the article details when available", async () => {
    const share = vi.fn<(data: ShareData) => Promise<void>>().mockResolvedValue();

    stubShare(share);
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const container = mount(() => <ArticleShare article={article} />);
    const button = container.querySelector("button")!;

    await expect.poll(() => button.getAttribute("aria-label")).toBe("Share");

    button.click();

    await expect.poll(() => share.mock.calls.length).toBe(1);
    expect(share).toHaveBeenCalledWith({
      title: "Log 001",
      text: "Enough to start.",
      url: "https://frantss.uy/writing/log-001",
    });
    await expect.poll(() => vi.mocked(analytics_capture).mock.calls.length).toBe(1);
    expect(analytics_capture).toHaveBeenCalledWith("article_shared", {
      article_slug: "log-001",
      locale: "en",
      method: "native",
    });
    expect(writeText).not.toHaveBeenCalled();
  });

  it("does nothing when the share sheet is dismissed", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("Share canceled", "AbortError"));

    stubShare(share);
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const container = mount(() => <ArticleShare article={article} />);
    const button = container.querySelector("button")!;

    await expect.poll(() => button.getAttribute("aria-label")).toBe("Share");

    button.click();

    await expect.poll(() => share.mock.calls.length).toBe(1);
    await Promise.resolve();
    expect(writeText).not.toHaveBeenCalled();
    expect(analytics_capture).not.toHaveBeenCalled();
    expect(container.querySelector('[role="status"]')?.textContent).toBe("");
  });
});
