import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { ArticleLikeButton } from "@/client/features/portfolio/article-like-button";
import { orpc } from "@/client/orpc/orpc.query";
import { setLocale } from "@/paraglide/runtime";

let dispose: (() => void) | undefined;

afterEach(async () => {
  dispose?.();
  vi.unstubAllGlobals();
  await setLocale("en", { reload: false });
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => (resolve = done));
  return { promise, resolve: (value: T) => resolve(value) };
}

function mount() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
  const [slug, setSlug] = createSignal("first");
  const container = document.createElement("div");
  document.body.append(container);
  const stop = render(
    () => (
      <QueryClientProvider client={queryClient}>
        <ArticleLikeButton slug={slug()} />
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
    expect(
      queryClient.getQueryData(orpc.articles.likes.get.queryKey({ input: { slug: "first" } })),
    ).toEqual({ count: 4 });
  });
});
