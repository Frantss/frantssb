import { gunzipSync, constants } from "node:zlib";
import { describe, expect, it, vi } from "vite-plus/test";
import { html_compressResponse } from "../html-response";

const html = "<!doctype html><html><body><!--$-->Hola, café<!--/--></body></html>";

function request(encoding = "gzip", init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  headers.set("accept-encoding", encoding);

  return new Request("http://localhost/work", { ...init, headers });
}

function response(body: BodyInit | null = html, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);

  if (!headers.has("content-type")) headers.set("content-type", "text/html; charset=utf-8");

  return new Response(body, { ...init, headers });
}

describe("HTML response compression", () => {
  it.each(["gzip", "br, gzip, deflate", "GZIP; q=0.5", "*", "gzip;q=0.001"])(
    "round-trips HTML when the client accepts %s",
    async (encoding) => {
      const result = html_compressResponse(request(encoding), response());

      expect(result.headers.get("content-encoding")).toBe("gzip");
      expect(result.headers.get("vary")).toBe("Accept-Encoding");
      expect(gunzipSync(Buffer.from(await result.arrayBuffer())).toString()).toBe(html);
    },
  );

  it.each([
    "",
    "identity",
    "br",
    "gzip;q=0",
    "gzip;q=0, *;q=1",
    "*;q=0",
    "gzip;q=invalid",
    "gzip;q=2",
  ])("returns plain HTML with Vary for %s", async (encoding) => {
    const result = html_compressResponse(request(encoding), response());

    expect(result.headers.has("content-encoding")).toBe(false);
    expect(result.headers.get("vary")).toBe("Accept-Encoding");
    await expect(result.text()).resolves.toBe(html);
  });

  it("preserves status, cookies, cache policy and existing Vary while replacing length and validators", async () => {
    const result = html_compressResponse(
      request(),
      response(html, {
        status: 404,
        statusText: "Not Found",
        headers: {
          "content-length": String(Buffer.byteLength(html)),
          "cache-control": "private, no-store",
          "set-cookie": "x-frantss-locale=es; Path=/",
          vary: "Cookie",
          etag: '"original"',
        },
      }),
    );

    expect(result.status).toBe(404);
    expect(result.statusText).toBe("Not Found");
    expect(result.headers.has("content-length")).toBe(false);
    expect(result.headers.get("cache-control")).toBe("private, no-store");
    expect(result.headers.get("set-cookie")).toBe("x-frantss-locale=es; Path=/");
    expect(result.headers.get("vary")).toBe("Cookie, Accept-Encoding");
    expect(result.headers.get("etag")).toBe('W/"original"');
    expect(gunzipSync(Buffer.from(await result.arrayBuffer())).toString()).toBe(html);
  });

  it.each(["*", "Cookie, accept-encoding"])("preserves existing Vary %s", async (vary) => {
    const result = html_compressResponse(request(), response(html, { headers: { vary } }));

    expect(result.headers.get("vary")).toBe(vary);
    await result.arrayBuffer();
  });

  it.each([
    ["content-type", "application/json"],
    ["content-type", "text/event-stream"],
    ["content-encoding", "br"],
    ["content-range", "bytes 0-5/100"],
    ["cache-control", "private, no-transform"],
  ])("leaves ineligible responses untouched: %s=%s", (name, value) => {
    const original = response(html, { headers: { [name]: value } });

    expect(html_compressResponse(request(), original)).toBe(original);
  });

  it.each(["HEAD", "POST"])("leaves %s responses untouched", (method) => {
    const original = response();

    expect(html_compressResponse(request("gzip", { method }), original)).toBe(original);
  });

  it("leaves bodyless responses untouched", () => {
    const original = response(null, { status: 304 });

    expect(html_compressResponse(request(), original)).toBe(original);
  });

  it("delivers usable HTML before the source stream finishes", async () => {
    let source!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        source = controller;
        controller.enqueue(new TextEncoder().encode("<html>first"));
      },
    });
    const result = html_compressResponse(request(), response(stream));
    const reader = result.body!.getReader();
    const first = await reader.read();

    expect(first.done).toBe(false);
    expect(gunzipSync(first.value!, { finishFlush: constants.Z_SYNC_FLUSH }).toString()).toBe(
      "<html>first",
    );
    source.enqueue(new TextEncoder().encode("last</html>"));
    source.close();
    const chunks = [first.value!];

    for (;;) {
      const next = await reader.read();

      if (next.done) break;
      chunks.push(next.value);
    }
    expect(gunzipSync(Buffer.concat(chunks)).toString()).toBe("<html>firstlast</html>");
  });

  it("cancels the source when the client stops reading", async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("<html>first"));
      },
      cancel,
    });
    const result = html_compressResponse(request(), response(stream));
    const reader = result.body!.getReader();

    await reader.read();
    await reader.cancel();
    await vi.waitFor(() => expect(cancel).toHaveBeenCalledOnce());
  });

  it("propagates render failures to the compressed response", async () => {
    const failure = new Error("render failed");
    const stream = new ReadableStream<Uint8Array>({
      start: (controller) => controller.error(failure),
    });
    const result = html_compressResponse(request(), response(stream));

    await expect(result.arrayBuffer()).rejects.toThrow("render failed");
  });
});
