import "@tanstack/solid-start/server-only";
import { Duplex } from "node:stream";
import { constants, createGzip } from "node:zlib";

export function html_compressResponse(request: Request, response: Response): Response {
  const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  const noTransform = response.headers
    .get("cache-control")
    ?.split(",")
    .some((directive) => directive.trim().toLowerCase() === "no-transform");

  if (
    request.method !== "GET" ||
    !response.body ||
    contentType !== "text/html" ||
    response.headers.has("content-encoding") ||
    response.headers.has("content-range") ||
    noTransform
  ) {
    return response;
  }

  const headers = new Headers(response.headers);
  const varies =
    headers
      .get("vary")
      ?.split(",")
      .map((value) => value.trim().toLowerCase()) ?? [];

  if (!varies.includes("*") && !varies.includes("accept-encoding")) {
    headers.append("vary", "Accept-Encoding");
  }
  if (!acceptsGzip(request.headers.get("accept-encoding") ?? "")) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  headers.set("content-encoding", "gzip");
  headers.delete("content-length");
  const etag = headers.get("etag");

  if (etag && !etag.startsWith("W/")) headers.set("etag", `W/${etag}`);
  const gzip = createGzip({ level: 6, flush: constants.Z_SYNC_FLUSH });
  const transform = Duplex.toWeb(gzip) as ReadableWritablePair<Uint8Array, Uint8Array>;
  const body = response.body.pipeThrough(transform, { signal: request.signal });

  return new Response(body, { status: response.status, statusText: response.statusText, headers });
}

function acceptsGzip(header: string): boolean {
  const encodings = new Map(
    header
      .toLowerCase()
      .split(",")
      .map((value): [string, number] => {
        const [encoding, ...parameters] = value.trim().split(";");
        const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));

        return [encoding.trim(), quality === undefined ? 1 : Number(quality.trim().slice(2))];
      }),
  );
  const quality = encodings.get("gzip") ?? encodings.get("*") ?? 0;

  return Number.isFinite(quality) && quality > 0 && quality <= 1;
}
