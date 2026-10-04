import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import {
  theme_applyStored,
  theme_current,
  theme_observe,
  theme_reveal,
  theme_script,
  theme_set,
} from "@/client/features/theme/theme";
import "@/client/styles/global.css";

afterEach(() => {
  vi.restoreAllMocks();
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

  it.each(["light", "dark"] as const)(
    "reveals %s from the button across the viewport",
    async (theme) => {
      const button = document.createElement("button");
      const page = document.createElement("div");

      button.style.cssText = "position:fixed;left:40px;top:60px;width:44px;height:44px";
      page.className = "page-content";
      document.body.append(button, page);
      theme_set(theme === "light" ? "dark" : "light");
      const reveal = theme_reveal(theme, button);

      try {
        await expect
          .poll(() =>
            document.getAnimations().some((animation) => {
              const effect = animation.effect as KeyframeEffect;

              return effect.pseudoElement === "::view-transition-new(root)";
            }),
          )
          .toBe(true);
        const animation = document
          .getAnimations()
          .find(
            (animation) =>
              (animation.effect as KeyframeEffect).pseudoElement === "::view-transition-new(root)",
          )!;

        animation.pause();
        animation.currentTime = 275;
        expect(theme_current()).toBe(theme);
        expect(getComputedStyle(page).viewTransitionName).toBe("none");
        expect(
          getComputedStyle(document.documentElement, "::view-transition-old(root)").opacity,
        ).toBe("1");
        const clip = getComputedStyle(
          document.documentElement,
          "::view-transition-new(root)",
        ).clipPath;
        const radius = Number(/circle\(([\d.]+)px/.exec(clip)?.[1]);

        expect(clip).toContain("at 62px 82px");
        expect(radius).toBeGreaterThan(0);
        expect(radius).toBeLessThan(Math.hypot(window.innerWidth - 62, window.innerHeight - 82));
        animation.finish();
        await reveal;
        expect(document.documentElement.hasAttribute("data-theme-transition")).toBe(false);
        expect(getComputedStyle(page).viewTransitionName).toBe("page-content");
        delete document.documentElement.dataset.theme;
        theme_applyStored();
        expect(theme_current()).toBe(theme);
      } finally {
        for (const animation of document.getAnimations()) animation.finish();
        await reveal;
        button.remove();
        page.remove();
      }
    },
  );

  it("switches immediately when reduced motion is preferred", async () => {
    const matchMedia = window.matchMedia.bind(window);

    vi.spyOn(window, "matchMedia").mockImplementation((query) => {
      const media = matchMedia(query);

      if (query === "(prefers-reduced-motion: reduce)") {
        Object.defineProperty(media, "matches", { value: true });
      }

      return media;
    });
    const startTransition = vi.spyOn(document, "startViewTransition");
    const reveal = theme_reveal("dark", document.createElement("button"));

    expect(theme_current()).toBe("dark");
    expect(startTransition).not.toHaveBeenCalled();
    await reveal;
  });
});
