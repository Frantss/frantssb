import "@tanstack/solid-start/server-only";

export type Context = {
  headers: Headers;
};

export function createContext(headers: Headers): Context {
  return { headers };
}
