import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { render } from "solid-js/web";
import type { JSX } from "solid-js";
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
