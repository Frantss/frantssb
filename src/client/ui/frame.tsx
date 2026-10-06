import type { JSX, ParentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

// Full-bleed horizontal rules with a centered column framed by vertical rules.
// Viewport-tall: the bands stay put and only the fill scrolls. Print falls back to document flow.
function FrameRoot(props: ParentProps) {
  return <div class="flex h-dvh flex-col print:h-auto">{props.children}</div>;
}

function BandShell(props: ParentProps<{ class?: string }>) {
  return (
    <div class={cn("flex flex-col border-b border-line last:border-b-0", props.class)}>
      <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col border-x border-line">
        {props.children}
      </div>
    </div>
  );
}

function FrameBand(props: ParentProps) {
  return <BandShell>{props.children}</BandShell>;
}

// Takes the remaining height and scrolls its own content. The router resets it to the top on
// navigation and restores it on back/forward.
const fillId = "frame-fill";

function FrameFill(props: ParentProps<{ overlay?: JSX.Element }>) {
  return (
    <div class="relative flex min-h-0 flex-1 flex-col border-b border-line last:border-b-0">
      {/* Rules stay outside the scroll layer so native overscroll cannot expose a gap. */}
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 left-1/2 z-10 flex w-full max-w-4xl -translate-x-1/2 border-x border-line print:hidden"
      >
        {props.overlay}
      </div>
      <div id={fillId} class="min-h-0 flex-1 overflow-y-auto print:overflow-visible">
        <div class="mx-auto flex min-h-full w-full max-w-4xl flex-col border-x border-transparent print:border-line">
          {props.children}
        </div>
      </div>
    </div>
  );
}

export const Frame = {
  Root: FrameRoot,
  Band: FrameBand,
  Fill: FrameFill,
  fillSelector: `#${fillId}`,
};
