import type { ParentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

// Full-bleed horizontal rules with a centered column framed by vertical rules.
// Viewport-tall: the bands stay put and only the fill scrolls. Print falls back to document flow.
function FrameRoot(props: ParentProps) {
  return <div class="flex h-dvh flex-col print:h-auto">{props.children}</div>;
}

function BandShell(props: ParentProps<{ class?: string; id?: string }>) {
  return (
    <div
      id={props.id}
      class={cn("flex flex-col border-b border-line last:border-b-0", props.class)}
    >
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

function FrameFill(props: ParentProps) {
  return (
    <BandShell id={fillId} class="min-h-0 flex-1 overflow-y-auto print:overflow-visible">
      {props.children}
    </BandShell>
  );
}

export const Frame = {
  Root: FrameRoot,
  Band: FrameBand,
  Fill: FrameFill,
  fillSelector: `#${fillId}`,
};
