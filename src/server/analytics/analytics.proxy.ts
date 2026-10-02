import "@tanstack/solid-start/server-only";
import { posthog_initialize } from "@/server/posthog/posthog";

const prefix = "/api/angry-ankylosaurus/";
const hopHeaders = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
];

function stripHopHeaders(headers: Headers) {
  for (const name of (headers.get("connection") ?? "").split(",")) {
    if (name.trim()) headers.delete(name.trim());
  }
  for (const name of hopHeaders) headers.delete(name);
}

export async function analytics_proxy(request: Request, clientIP?: string): Promise<Response> {
  posthog_initialize();
  const incoming = new URL(request.url);

  const path = incoming.pathname.slice(prefix.length - 1);
  const upstream = new URL(
    path.startsWith("/static/") || path.startsWith("/array/")
      ? "https://us-assets.i.posthog.com"
      : "https://us.i.posthog.com",
  );
  upstream.pathname = path;
  upstream.search = incoming.search;

  const headers = new Headers(request.headers);
  stripHopHeaders(headers);
  for (const name of [
    "cookie",
    "authorization",
    "host",
    "forwarded",
    "x-forwarded-for",
    "x-real-ip",
  ])
    headers.delete(name);
  headers.set("x-forwarded-host", incoming.host);
  if (clientIP) {
    headers.set("x-forwarded-for", clientIP);
    headers.set("x-real-ip", clientIP);
  }

  try {
    const response = await fetch(upstream, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      duplex: "half",
      redirect: "manual",
      signal: request.signal,
    } as RequestInit & { duplex: "half" });
    const responseHeaders = new Headers(response.headers);
    stripHopHeaders(responseHeaders);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("set-cookie");
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return new Response("Bad gateway", { status: 502 });
  }
}
