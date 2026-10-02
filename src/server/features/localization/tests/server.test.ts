import handler, { type ServerEntry } from "@tanstack/solid-start/server-entry";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import server from "@/server";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

vi.mock("@tanstack/solid-start/server-entry", () => ({
  default: { fetch: vi.fn() },
  createServerEntry: (entry: ServerEntry) => entry,
}));

beforeEach(() => {
  vi.mocked(handler.fetch).mockReset();
});

describe("server locale", () => {
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
});
