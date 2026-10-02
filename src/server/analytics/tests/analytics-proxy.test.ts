// @vitest-environment node
import { gzipSync } from "node:zlib";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { analytics_proxy } from "@/server/analytics/analytics.proxy";

const posthog = vi.hoisted(() => ({ initialize: vi.fn() }));
vi.mock("@/server/posthog/posthog", () => ({ posthog_initialize: posthog.initialize }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe("analytics proxy", () => {
  it("initializes the process-wide server client", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await analytics_proxy(new Request("https://app.example.test/api/angry-ankylosaurus/e/"));

    expect(posthog.initialize).toHaveBeenCalledOnce();
  });

  it.each(["/static/1.434.2/posthog-recorder.js", "/array/project/config.js"])(
    "routes %s to the asset host and preserves the query",
    async (path) => {
      const fetcher = vi.fn().mockResolvedValue(new Response("script"));
      vi.stubGlobal("fetch", fetcher);
      await analytics_proxy(
        new Request(`https://app.example.test/api/angry-ankylosaurus${path}?v=2`),
      );
      expect(String(fetcher.mock.calls[0][0])).toBe(`https://us-assets.i.posthog.com${path}?v=2`);
    },
  );

  it("forwards compressed uploads intact without application credentials", async () => {
    const payload = gzipSync(JSON.stringify({ event: "$pageview" }));
    const fetcher = vi.fn().mockResolvedValue(new Response("ok"));
    vi.stubGlobal("fetch", fetcher);
    await analytics_proxy(
      new Request("https://app.example.test/api/angry-ankylosaurus/e/?compression=gzip", {
        method: "POST",
        body: payload,
        headers: {
          "content-encoding": "gzip",
          cookie: "session=private",
          authorization: "Bearer private",
          connection: "x-private",
          "x-private": "private",
          "x-forwarded-for": "spoofed",
        },
      }),
      "203.0.113.10",
    );
    const [url, init] = fetcher.mock.calls[0];
    expect(String(url)).toBe("https://us.i.posthog.com/e/?compression=gzip");
    expect(Buffer.from(await new Response(init.body).arrayBuffer())).toEqual(payload);
    for (const name of ["cookie", "authorization", "connection", "x-private"])
      expect(init.headers.has(name)).toBe(false);
    expect(init.headers.get("x-forwarded-for")).toBe("203.0.113.10");
    expect(init.headers.get("x-real-ip")).toBe("203.0.113.10");
    expect(init.headers.get("x-forwarded-host")).toBe("app.example.test");
    expect(init.headers.get("content-encoding")).toBe("gzip");
  });

  it("preserves decoded response bytes and status without stale encoding headers or cookies", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("decoded", {
          status: 429,
          headers: {
            "content-encoding": "gzip",
            "content-length": "99",
            "set-cookie": "upstream=1",
            "retry-after": "5",
          },
        }),
      ),
    );
    const response = await analytics_proxy(
      new Request("https://app.example.test/api/angry-ankylosaurus/s/"),
    );
    expect(response.status).toBe(429);
    expect(await response.text()).toBe("decoded");
    expect(response.headers.get("retry-after")).toBe("5");
    for (const name of ["content-encoding", "content-length", "set-cookie"])
      expect(response.headers.has(name)).toBe(false);
  });

  it("cannot redirect the upstream host through the request path", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetcher);
    await analytics_proxy(
      new Request("https://app.example.test/api/angry-ankylosaurus//evil.test/e/"),
    );
    expect(fetcher.mock.calls[0][0].origin).toBe("https://us.i.posthog.com");
    expect(fetcher.mock.calls[0][1].redirect).toBe("manual");
  });

  it("returns a gateway error when the upstream fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection failed")));
    expect(
      (await analytics_proxy(new Request("https://app.example.test/api/angry-ankylosaurus/e/")))
        .status,
    ).toBe(502);
  });
});
