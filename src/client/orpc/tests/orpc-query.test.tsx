import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/solid-query";
import { createSignal, Suspense, type Setter } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { orpc } from "@/client/orpc/orpc.query";
import { getRouter } from "@/router";

vi.mock("@/routeTree.gen", async () => {
  const { createRootRoute } = await import("@tanstack/solid-router");
  return { routeTree: createRootRoute() };
});

let dispose: (() => void) | undefined;
const clients: QueryClient[] = [];

afterEach(() => {
  dispose?.();
  dispose = undefined;
  clients.splice(0).forEach((client) => client.clear());
  vi.unstubAllGlobals();
});

function createRouter() {
  const router = getRouter();
  clients.push(router.options.context.queryClient);
  return router;
}

describe("oRPC with Solid Query", () => {
  it("provides the router cache to queries and keeps router instances isolated", async () => {
    const fetch = vi.fn(async (_url: string, _init: RequestInit) =>
      Response.json({ status: "ok" }),
    );
    vi.stubGlobal("fetch", fetch);
    const router = createRouter();
    const other = createRouter();
    const Wrap = router.options.Wrap!;
    let provided: QueryClient | undefined;

    function Health() {
      provided = useQueryClient();
      const query = useQuery(() => orpc.health.queryOptions());
      return <output>{query.data?.status}</output>;
    }

    const container = document.createElement("div");
    const stop = render(
      () => (
        <Wrap>
          <Suspense>
            <Health />
            <Health />
          </Suspense>
        </Wrap>
      ),
      container,
    );
    dispose = stop;

    await vi.waitFor(() => expect(container.textContent).toBe("okok"));
    expect(provided).toBe(router.options.context.queryClient);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0]?.[0]).toBe("/api/health");
    expect(other.options.context.queryClient.getQueryData(orpc.health.queryKey())).toBeUndefined();
  });

  it("tracks reactive inputs and refetches after a REST mutation", async () => {
    const counts: Record<string, number> = { first: 2, second: 7 };
    const fetch = vi.fn(async (url: string, init: RequestInit) => {
      const slug = new URL(url, location.origin).pathname.split("/")[3];
      if (init.method === "POST") counts[slug] += 1;
      return Response.json({ count: counts[slug] });
    });
    vi.stubGlobal("fetch", fetch);
    const router = createRouter();
    const Wrap = router.options.Wrap!;
    let setSlug!: Setter<string>;
    let addLike!: () => Promise<unknown>;

    function Likes() {
      const [slug, updateSlug] = createSignal("first");
      setSlug = updateSlug;
      const queryClient = useQueryClient();
      const query = useQuery(() =>
        orpc.articles.likes.get.queryOptions({ input: { slug: slug() } }),
      );
      const mutation = useMutation(() =>
        orpc.articles.likes.add.mutationOptions({
          onSuccess: (_output, input) =>
            queryClient.invalidateQueries({
              queryKey: orpc.articles.likes.get.key({ input }),
            }),
        }),
      );
      addLike = () => mutation.mutateAsync({ slug: slug() });
      return <output>{query.data?.count}</output>;
    }

    const container = document.createElement("div");
    dispose = render(
      () => (
        <Wrap>
          <Suspense>
            <Likes />
          </Suspense>
        </Wrap>
      ),
      container,
    );

    await vi.waitFor(() => expect(container.textContent).toBe("2"));
    setSlug("second");
    await vi.waitFor(() => expect(container.textContent).toBe("7"));
    await addLike();
    await vi.waitFor(() => expect(container.textContent).toBe("8"));
    expect(
      fetch.mock.calls.some(
        ([url, init]) => url === "/api/articles/second/likes" && init.method === "POST",
      ),
    ).toBe(true);
    expect(
      router.options.context.queryClient.getQueryData(
        orpc.articles.likes.get.queryKey({ input: { slug: "first" } }),
      ),
    ).toEqual({ count: 2 });
  });
});
