import "@tanstack/solid-start/server-only";
import { db } from "@/server/db/db";

export type Context = {
  headers: Headers;
  db: typeof db;
};

export function createContext(headers: Headers): Context {
  return { headers, db };
}
