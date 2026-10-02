// @vitest-environment node
import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi/fetch";
import type { RouterClient } from "@orpc/server";
import { afterAll, describe, expect, it, vi } from "vite-plus/test";
import { handleAPI } from "@/server/orpc/orpc.handler";
import { contract } from "@/shared/orpc/orpc.contract";
import type { router } from "@/server/orpc/orpc.router";
import { db } from "@/server/db/db";

vi.hoisted(() => {
  vi.stubEnv("DATABASE_URL", "postgresql://unused:unused@127.0.0.1:1/unused");
});

afterAll(async () => {
  await db.$client.end();
  vi.unstubAllEnvs();
});

describe("OpenAPI transport", () => {
  it("routes GET /api/health and returns plain JSON", async () => {
    const response = await handleAPI(new Request("http://localhost/api/health"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  it("round-trips a typed procedure through the Fetch handler", async () => {
    const client: RouterClient<typeof router> = createORPCClient(
      new OpenAPILink(contract, {
        url: "/api",
        origin: "http://localhost",
        fetch: (url, init) => handleAPI(new Request(url, init)),
      }),
    );

    await expect(client.health()).resolves.toEqual({ status: "ok" });
  });

  it("returns 404 for unknown procedures", async () => {
    const response = await handleAPI(new Request("http://localhost/api/missing"));

    expect(response.status).toBe(404);
  });
});
