import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { createSignal, type JSX } from "solid-js";
import { render } from "solid-js/web";
import { IconButton } from "@/client/ui/icon-button";
import { IconLink } from "@/client/ui/icon-link";
import { Tooltip } from "@/client/ui/tooltip";

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

describe("Tooltip", () => {
  it("dismisses a tooltip inside a native popover without dismissing the popover", async () => {
    const container = mount(() => (
      <nav popover>
        <Tooltip label="Settings">
          {(triggerProps) => (
            <button {...triggerProps()} aria-label="Settings">
              S
            </button>
          )}
        </Tooltip>
      </nav>
    ));
    const popover = container.querySelector("nav")!;
    const button = container.querySelector("button")!;

    popover.showPopover();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    button.focus();
    await expect.poll(() => document.querySelector('[role="tooltip"]')).not.toBeNull();
    expect(popover.querySelector('[role="tooltip"]')).not.toBeNull();

    const escape = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });

    button.dispatchEvent(escape);
    await expect.poll(() => document.querySelector('[role="tooltip"]')).toBeNull();
    expect(escape.defaultPrevented).toBe(true);
    expect(popover.matches(":popover-open")).toBe(true);
  });

  it("opens on keyboard focus, updates its label, and dismisses on Escape and click", async () => {
    const [label, setLabel] = createSignal("Switch to dark theme");
    const onClick = vi.fn();
    const container = mount(() => (
      <Tooltip label={label()}>
        {(triggerProps) => (
          <IconButton {...triggerProps({ onClick })} aria-label={label()}>
            ☾
          </IconButton>
        )}
      </Tooltip>
    ));
    const button = container.querySelector("button")!;

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    button.focus();

    await expect.poll(() => document.querySelector('[role="tooltip"]')?.textContent).toBe(label());
    expect(button.getAttribute("aria-describedby")).toBe(
      document.querySelector('[role="tooltip"]')?.id,
    );

    setLabel("Switch to light theme");
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(label());
    button.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await expect.poll(() => document.querySelector('[role="tooltip"]')).toBeNull();

    button.blur();
    button.focus();
    await expect.poll(() => document.querySelector('[role="tooltip"]')).not.toBeNull();
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
    await expect.poll(() => document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it("shows one tooltip on pointer hover and keeps the link's click handler", async () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const container = mount(() => (
      <>
        <Tooltip label="Profile">
          {(triggerProps) => (
            <IconLink {...triggerProps({ onClick })} href="/profile" aria-label="Profile">
              P
            </IconLink>
          )}
        </Tooltip>
        <Tooltip label="Settings">
          {(triggerProps) => (
            <IconButton {...triggerProps()} aria-label="Settings">
              S
            </IconButton>
          )}
        </Tooltip>
      </>
    ));
    const anchor = container.querySelector("a")!;
    const button = container.querySelector("button")!;
    const hover = (element: HTMLElement) =>
      element.dispatchEvent(
        new PointerEvent("pointermove", { pointerType: "mouse", bubbles: true }),
      );

    hover(button);
    await expect
      .poll(() => document.querySelector('[role="tooltip"]')?.textContent)
      .toBe("Settings");
    hover(anchor);
    await expect
      .poll(() => document.querySelector('[role="tooltip"]')?.textContent)
      .toBe("Profile");
    expect(document.querySelectorAll('[role="tooltip"]')).toHaveLength(1);
    expect(anchor.getAttribute("href")).toBe("/profile");
    anchor.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "mouse", bubbles: true }));
    anchor.click();
    expect(onClick).toHaveBeenCalledOnce();
    await expect.poll(() => document.querySelector('[role="tooltip"]')).toBeNull();
  });
});
