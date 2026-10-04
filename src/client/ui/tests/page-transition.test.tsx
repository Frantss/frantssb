import { afterEach, expect, it } from "vite-plus/test";
import { createSignal, Show } from "solid-js";
import { render } from "solid-js/web";
import { Page } from "@/client/ui/page";
import "@/client/styles/global.css";

let dispose: (() => void) | undefined;

afterEach(() => dispose?.());

it("replaces the outgoing page without overlapping its snapshot and staggers the new content", async () => {
  const container = document.createElement("div");

  document.body.append(container);
  const [page, setPage] = createSignal("old");
  const stop = render(
    () => (
      <Show when={page()} keyed>
        {(name) => (
          <Page>
            <h1>{name}</h1>
            <p>Second section</p>
            <p>Third section</p>
          </Page>
        )}
      </Show>
    ),
    container,
  );

  dispose = () => {
    stop();
    container.remove();
  };

  const transition = document.startViewTransition(() => {
    setPage("new");
  });

  await transition.ready;
  const outgoing = getComputedStyle(
    document.documentElement,
    "::view-transition-old(page-content)",
  );
  const outgoingVisible =
    outgoing.display !== "none" && outgoing.visibility !== "hidden" && Number(outgoing.opacity) > 0;

  expect(outgoingVisible).toBe(false);
  expect(container.querySelector("h1")?.textContent).toBe("new");

  await transition.finished;
  const sections = container.querySelector(".page-content")!.children;

  for (const section of sections) {
    for (const animation of section.getAnimations()) {
      animation.pause();
      animation.currentTime = 30;
    }
  }
  const opacities = Array.from(sections, (section) => Number(getComputedStyle(section).opacity));

  expect(opacities[0]).toBeGreaterThan(opacities[1]!);
  expect(opacities[1]).toBeGreaterThanOrEqual(opacities[2]!);
});
