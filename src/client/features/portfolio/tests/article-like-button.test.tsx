import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { ArticleLikeButton } from "@/client/features/portfolio/article-like-button";
import { orpc } from "@/client/orpc/orpc.query";
import { ToastProvider } from "@/client/ui/toast";
import { setLocale } from "@/paraglide/runtime";
import "@/client/styles/global.css";

let dispose: (() => void) | undefined;

afterEach(async () => {
  dispose?.();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.removeItem("article:liked:first");
  localStorage.removeItem("article:liked:second");
  await setLocale("en", { reload: false });
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => (resolve = done));

  return { promise, resolve: (value: T) => resolve(value) };
}

function mount(size: "sm" | "md" = "md") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
  const [slug, setSlug] = createSignal("first");
  const container = document.createElement("div");

  document.body.append(container);
  const stop = render(
    () => (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ArticleLikeButton slug={slug()} size={size} />
        </ToastProvider>
      </QueryClientProvider>
    ),
    container,
  );

  dispose = () => {
    stop();
    queryClient.clear();
    container.remove();
  };

  return { container, queryClient, setSlug };
}

describe("article like button", () => {
  it("shows a cooldown for a rejected like, keeps the count and heart unchanged, and waits for another click", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ count: 4 }))
      .mockImplementationOnce(async () =>
        Response.json(
          {
            defined: true,
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests",
            data: { limit: 30, remaining: 0, reset: Date.now() + 2000 },
          },
          { status: 429 },
        ),
      )
      .mockResolvedValueOnce(Response.json({ count: 5 }));

    vi.stubGlobal("fetch", fetch);
    const { container } = mount();

    await vi.waitFor(() => expect(container.querySelector("button")?.textContent).toBe("4"));
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    const button = container.querySelector("button")!;

    button.click();
    await vi.waitFor(() => expect(button.disabled).toBe(true));
    expect(document.querySelector("[data-part='title']")?.textContent).toContain("Try again in 2s");
    expect(container.querySelector("[role='alert']")).toBeNull();
    expect(button.textContent).toBe("4");
    expect(button.querySelector(".tabler-icon-heart-filled")).toBeNull();
    expect(localStorage.getItem("article:liked:first")).toBeNull();
    button.click();
    expect(fetch).toHaveBeenCalledTimes(2);
    document.querySelector<HTMLButtonElement>("[data-part='close-trigger']")!.click();
    await vi.advanceTimersByTimeAsync(200);
    expect(
      document.querySelector("[data-scope='toast'][data-part='root']")?.getAttribute("data-state"),
    ).toBe("closed");
    expect(button.disabled).toBe(true);
    await vi.advanceTimersByTimeAsync(1800);
    expect(button.disabled).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(2);
    button.click();
    await vi.waitFor(() => expect(button.textContent).toBe("5"));
    expect(button.querySelector(".tabler-icon-heart-filled")).not.toBeNull();
    expect(container.querySelector("[role='alert']")).toBeNull();
  });

  it.each(["sm", "md"] as const)(
    "replays the heart animation after each successful like (%s)",
    async (size) => {
      localStorage.setItem("article:liked:first", "true");
      const fetch = vi
        .fn()
        .mockResolvedValueOnce(Response.json({ count: 4 }))
        .mockResolvedValueOnce(Response.json({ count: 5 }))
        .mockResolvedValueOnce(Response.json({ count: 6 }));

      vi.stubGlobal("fetch", fetch);
      const { container } = mount(size);

      await vi.waitFor(() => expect(container.querySelector("button")?.textContent).toBe("4"));
      const button = container.querySelector("button")!;
      const initialHeart = button.querySelector("span")!;

      expect(getComputedStyle(initialHeart).animationName).toBe("none");
      button.click();
      await vi.waitFor(() => expect(button.textContent).toBe("5"));
      const firstHeart = button.querySelector("span")!;
      const firstAnimation = firstHeart.getAnimations()[0];

      expect(getComputedStyle(firstHeart).animationName).toBe("article-like-heart");
      expect(firstAnimation).toBeDefined();
      button.click();
      await vi.waitFor(() => expect(button.textContent).toBe("6"));
      const secondHeart = button.querySelector("span")!;
      const secondAnimation = secondHeart.getAnimations()[0];

      expect(getComputedStyle(secondHeart).animationName).toBe("article-like-heart");
      expect(secondAnimation).toBeDefined();
      expect(secondAnimation).not.toBe(firstAnimation);
    },
  );

  it("loads zero and accepts every click while responses arrive out of order", async () => {
    const initial = deferred<Response>();
    const first = deferred<Response>();
    const second = deferred<Response>();
    const posts = [first, second];
    const fetch = vi.fn((_url: string, init: RequestInit) =>
      init.method === "POST" ? posts.shift()!.promise : initial.promise,
    );

    vi.stubGlobal("fetch", fetch);
    const { container, queryClient } = mount();

    expect(container.querySelector("button")?.disabled).toBe(true);
    expect(container.querySelector("button")?.getAttribute("aria-label")).toBe("Loading likes");
    initial.resolve(Response.json({ count: 0 }));
    await vi.waitFor(() => expect(container.querySelector("button")?.textContent).toBe("0"));
    const button = container.querySelector("button")!;

    button.click();
    button.click();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    expect(button.disabled).toBe(false);
    expect(fetch.mock.calls.slice(1).map(([url, init]) => [url, init.method])).toEqual([
      ["/api/articles/first/likes", "POST"],
      ["/api/articles/first/likes", "POST"],
    ]);

    second.resolve(Response.json({ count: 2 }));
    await vi.waitFor(() => expect(button.textContent).toBe("2"));
    first.resolve(Response.json({ count: 1 }));
    await vi.waitFor(() => expect(queryClient.isMutating()).toBe(0));
    expect(button.textContent).toBe("2");
    expect(button.getAttribute("aria-label")).toBe("Like this article. Current likes: 2.");
    expect(container.querySelector("[role='status']")?.textContent).toBe("2 likes");
    expect(button.querySelector(".tabler-icon-heart-filled")).not.toBeNull();
    expect(localStorage.getItem("article:liked:first")).toBe("true");
  });

  it("keeps the saved count after a failed write and retries only on another click", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ count: 4 }))
      .mockResolvedValueOnce(Response.json({}, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ count: 5 }));

    vi.stubGlobal("fetch", fetch);
    const { container, queryClient } = mount();

    await vi.waitFor(() => expect(container.querySelector("button")?.textContent).toBe("4"));
    const button = container.querySelector("button")!;

    button.click();
    await vi.waitFor(() => expect(container.querySelector("[role='alert']")).not.toBeNull());
    expect(button.textContent).toBe("4");
    expect(button.querySelector(".tabler-icon-heart-filled")).toBeNull();
    expect(localStorage.getItem("article:liked:first")).toBeNull();
    expect(button.getAttribute("aria-describedby")).toBe(
      container.querySelector("[role='alert']")?.id,
    );
    expect(queryClient.isMutating()).toBe(0);
    expect(fetch).toHaveBeenCalledTimes(2);

    button.click();
    await vi.waitFor(() => expect(button.textContent).toBe("5"));
    expect(container.querySelector("[role='alert']")).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("offers a localized retry when the count cannot be loaded", async () => {
    await setLocale("es", { reload: false });
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({}, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ count: 12 }));

    vi.stubGlobal("fetch", fetch);
    const { container } = mount();

    await vi.waitFor(() => expect(container.querySelector("[role='alert']")).not.toBeNull());
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(container.querySelector("button")?.textContent).toBe("Recargar me gusta");
    container.querySelector("button")!.click();
    await vi.waitFor(() => expect(container.querySelector("button")?.textContent).toBe("12"));
    expect(container.querySelector("button")?.getAttribute("aria-label")).toBe(
      "Me gusta este artículo. Total: 12.",
    );
    expect(container.querySelector("[role='alert']")).toBeNull();
  });

  it("keeps a pending response attached to its article after the slug changes", async () => {
    const pending = deferred<Response>();

    vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
      if (init.method === "POST") return pending.promise;

      return Promise.resolve(Response.json({ count: url.includes("/first/") ? 3 : 8 }));
    });
    const { container, queryClient, setSlug } = mount();

    await vi.waitFor(() => expect(container.querySelector("button")?.textContent).toBe("3"));
    container.querySelector("button")!.click();
    await vi.waitFor(() => expect(queryClient.isMutating()).toBe(1));
    setSlug("second");
    await vi.waitFor(() => expect(container.querySelector("button")?.textContent).toBe("8"));
    pending.resolve(Response.json({ count: 4 }));
    await vi.waitFor(() => expect(queryClient.isMutating()).toBe(0));
    expect(container.querySelector("button")?.textContent).toBe("8");
    expect(container.querySelector(".tabler-icon-heart-filled")).toBeNull();
    expect(localStorage.getItem("article:liked:first")).toBe("true");
    expect(localStorage.getItem("article:liked:second")).toBeNull();
    expect(
      queryClient.getQueryData(orpc.articles.likes.get.queryKey({ input: { slug: "first" } })),
    ).toEqual({ count: 4 });
  });

  it("restores a saved like for its article without adding another like", async () => {
    localStorage.setItem("article:liked:first", "true");
    const fetch = vi.fn(async () => Response.json({ count: 4 }));

    vi.stubGlobal("fetch", fetch);
    const { container, setSlug } = mount();

    await vi.waitFor(() => expect(container.querySelector("button")?.textContent).toBe("4"));
    expect(container.querySelector(".tabler-icon-heart-filled")).not.toBeNull();
    setSlug("second");
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(container.querySelector(".tabler-icon-heart-filled")).toBeNull();
    setSlug("first");
    await vi.waitFor(() =>
      expect(container.querySelector(".tabler-icon-heart-filled")).not.toBeNull(),
    );
    expect(fetch.mock.calls).toHaveLength(2);
  });

  it("keeps liking available when browser storage cannot be read or written", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable", "SecurityError");
    });
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ count: 4 }))
      .mockResolvedValueOnce(Response.json({ count: 5 }));

    vi.stubGlobal("fetch", fetch);
    const { container } = mount();

    await vi.waitFor(() => expect(container.querySelector("button")?.textContent).toBe("4"));
    container.querySelector("button")!.click();
    await vi.waitFor(() => expect(container.querySelector("button")?.textContent).toBe("5"));
    expect(container.querySelector(".tabler-icon-heart-filled")).not.toBeNull();
    expect(container.querySelector("[role='alert']")).toBeNull();
  });
});
