import { describe, expect, it } from "vite-plus/test";

describe("project setup", () => {
  it("loads the Solid web runtime", async () => {
    const solidWeb = await import("solid-js/web");

    expect(solidWeb.render).toBeTypeOf("function");
  });
});
