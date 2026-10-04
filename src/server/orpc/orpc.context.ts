import "@tanstack/solid-start/server-only";
import { isIP } from "node:net";
import { db } from "@/server/db/db";

export type Context = {
  headers: Headers;
  db: typeof db;
  clientIP?: string;
};

export function createContext({
  headers,
  source = "http",
}: {
  headers: Headers;
  source?: "http" | "ssr";
}): Context {
  return { headers, db, clientIP: source === "http" ? clientIP(headers) : undefined };
}

function clientIP(headers: Headers): string {
  const address = headers.get("x-real-ip")?.trim();

  // Only Railway ingress is trusted to overwrite client-supplied IP headers.
  if (!process.env.RAILWAY_ENVIRONMENT_ID || !address || address.includes("%") || !isIP(address))
    return "unknown";
  if (isIP(address) === 4) return address;
  const normalized = new URL(`http://[${address}]`).hostname.slice(1, -1);
  const mapped = /^::ffff:([\da-f]+):([\da-f]+)$/.exec(normalized);

  if (!mapped) return normalized;
  const high = Number.parseInt(mapped[1], 16);
  const low = Number.parseInt(mapped[2], 16);

  return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
}
