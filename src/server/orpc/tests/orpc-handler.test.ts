import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi/fetch";
import type { RouterClient } from "@orpc/server";
import { afterAll, describe, expect, it } from "vite-plus/test";
import { db } from "@/server/db/db";
import { handleAPI } from "@/server/orpc/orpc.handler";
import type { router } from "@/server/orpc/orpc.router";
import { contract } from "@/shared/orpc/orpc.contract";

afterAll(() => db.$client.end());

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

  it.each(["/api/missing", "/health", "/api-other/health"])("returns 404 for %s", async (path) => {
    const response = await handleAPI(new Request(`http://localhost${path}`));

    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toBe("Not found");
  });

  it("rejects POST for the GET-only health procedure", async () => {
    const response = await handleAPI(
      new Request("http://localhost/api/health", { method: "POST" }),
    );

    expect(response.status).toBe(404);
  });
});
