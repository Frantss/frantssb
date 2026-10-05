import handler, { type ServerEntry } from "@tanstack/solid-start/server-entry";
import { gunzipSync } from "node:zlib";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import server from "@/server";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";

vi.mock("@tanstack/solid-start/server-entry", () => ({
  default: { fetch: vi.fn() },
  createServerEntry: (entry: ServerEntry) => entry,
}));

beforeEach(() => {
  vi.mocked(handler.fetch).mockReset();
});

describe("server locale", () => {
  it("compresses HTML after rendering in the request locale", async () => {
    vi.mocked(handler.fetch).mockImplementation(
      async () =>
        new Response(m.page_work(), { headers: { "content-type": "text/html; charset=utf-8" } }),
    );
    const response = await server.fetch(
      new Request("http://localhost/work", {
        headers: { cookie: "x-frantss-locale=es", "accept-encoding": "gzip" },
      }),
    );

    expect(response.headers.get("content-encoding")).toBe("gzip");
    expect(gunzipSync(Buffer.from(await response.arrayBuffer())).toString()).toBe("Experiencia");
  });

  it.each([
    ["", "en", "Work"],
    ["x-frantss-locale=en", "en", "Work"],
    ["x-frantss-locale=es", "es", "Experiencia"],
    ["x-frantss-locale=fr", "en", "Work"],
    ["PARAGLIDE_LOCALE=es", "en", "Work"],
  ])("renders %s using %s", async (cookie, locale, text) => {
    const request = new Request("http://localhost/work", { headers: { cookie } });

    vi.mocked(handler.fetch).mockImplementation(async (incoming) => {
      expect(incoming).toBe(request);
      await Promise.resolve();
      expect(getLocale()).toBe(locale);

      return new Response(m.page_work());
    });

    const response = await server.fetch(request);

    await expect(response.text()).resolves.toBe(text);
  });

  it("isolates overlapping English and Spanish requests across async work", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let remaining = 2;

    vi.mocked(handler.fetch).mockImplementation(async () => {
      if (--remaining === 0) release();
      await gate;

      return new Response(m.page_work());
    });

    const responses = await Promise.all(
      ["en", "es"].map(async (locale) =>
        server.fetch(
          new Request("http://localhost/work", {
            headers: { cookie: `x-frantss-locale=${locale}` },
          }),
        ),
      ),
    );

    await expect(Promise.all(responses.map((response) => response.text()))).resolves.toEqual([
      "Work",
      "Experiencia",
    ]);
  });

  it.each([
    ["", "en_US"],
    ["x-frantss-locale=es", "es_UY"],
    ["x-frantss-locale=fr", "en_US"],
  ])("matches social metadata to the request locale for %s", async (cookie, locale) => {
    vi.mocked(handler.fetch).mockImplementation(async () => {
      const metadata = seo({
        title: m.page_work(),
        description: m.meta_work({ name: "Francisco Bongiovanni" }),
        path: "/work",
        image: site.socialImage,
      });

      return Response.json(metadata);
    });

    const response = await server.fetch(
      new Request("http://localhost/work", { headers: { cookie } }),
    );
    const metadata = await response.json();

    expect(metadata.meta).toContainEqual({ property: "og:locale", content: locale });
  });
});
