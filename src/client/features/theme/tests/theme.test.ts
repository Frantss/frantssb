import { afterEach, describe, expect, it } from "vite-plus/test";
import {
  theme_applyStored,
  theme_current,
  theme_observe,
  theme_script,
  theme_set,
} from "@/client/features/theme/theme";

afterEach(() => {
  document.cookie = "theme=; Path=/; Max-Age=0";
  delete document.documentElement.dataset.theme;
});

describe("theme", () => {
  it("applies a stored theme cookie to the document", () => {
    document.cookie = "theme=dark; Path=/";
    theme_applyStored();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("leaves the document alone without a valid cookie", () => {
    document.cookie = "theme=sepia; Path=/";
    theme_applyStored();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("runs as a standalone inline script", () => {
    document.cookie = "theme=light; Path=/";
    const script = document.createElement("script");

    script.textContent = theme_script;
    document.head.append(script);
    script.remove();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("persists a chosen theme so the inline script restores it", () => {
    theme_set("light");
    delete document.documentElement.dataset.theme;
    theme_applyStored();
    expect(theme_current()).toBe("light");
  });

  it("notifies observers when the theme changes", async () => {
    const seen: string[] = [];
    const stop = theme_observe((theme) => seen.push(theme));

    theme_set("dark");
    await Promise.resolve();
    stop();
    theme_set("light");
    await Promise.resolve();
    expect(seen).toEqual(["dark"]);
  });

  it("falls back to the system preference", () => {
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    expect(theme_current()).toBe(system);
  });
});
