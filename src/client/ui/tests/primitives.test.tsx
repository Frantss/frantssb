import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { render } from "solid-js/web";
import type { JSX } from "solid-js";
import { ButtonLink } from "@/client/ui/button-link";
import { Facts } from "@/client/ui/facts";
import { IconButton } from "@/client/ui/icon-button";

let dispose: (() => void) | undefined;

function mount(ui: () => JSX.Element) {
  const container = document.createElement("div");
  document.body.append(container);
  const stop = render(ui, container);
  dispose = () => {
    stop();
    container.remove();
  };
  return container;
}

afterEach(() => dispose?.());

describe("ButtonLink", () => {
  it("forwards anchor attributes and merges classes", () => {
    const container = mount(() => (
      <ButtonLink.Solid href="mailto:a@b.c" target="_blank" class="w-full">
        Mail
      </ButtonLink.Solid>
    ));
    const anchor = container.querySelector("a")!;
    expect(anchor.getAttribute("href")).toBe("mailto:a@b.c");
    expect(anchor.target).toBe("_blank");
    expect(anchor.classList).toContain("bg-accent");
    expect(anchor.classList).toContain("w-full");
  });

  it("keeps the variants visually distinct", () => {
    const container = mount(() => <ButtonLink.Outline href="#">CV</ButtonLink.Outline>);
    const anchor = container.querySelector("a")!;
    expect(anchor.classList).toContain("border-accent");
    expect(anchor.classList).not.toContain("bg-accent");
  });
});

describe("IconButton", () => {
  it("defaults to a non-submitting button and forwards handlers", () => {
    const onClick = vi.fn();
    const container = mount(() => (
      <IconButton aria-label="Toggle" onClick={onClick}>
        ☾
      </IconButton>
    ));
    const button = container.querySelector("button")!;
    expect(button.type).toBe("button");
    expect(button.getAttribute("aria-label")).toBe("Toggle");
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("compound parts", () => {
  it("pairs fact labels with values in a definition list", () => {
    const container = mount(() => (
      <Facts.List>
        <Facts.Item label="role">Engineer</Facts.Item>
      </Facts.List>
    ));
    expect(container.querySelector("dl dt")?.textContent).toBe("role");
    expect(container.querySelector("dl dd")?.textContent).toBe("Engineer");
  });
});
