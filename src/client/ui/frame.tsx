import type { ParentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

// Full-bleed horizontal rules with a centered column framed by vertical rules.
function FrameRoot(props: ParentProps) {
  return <div class="flex min-h-screen flex-col">{props.children}</div>;
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

// Takes the remaining height so the footer band stays at the bottom.
function FrameFill(props: ParentProps) {
  return <BandShell class="flex-1">{props.children}</BandShell>;
}

export const Frame = { Root: FrameRoot, Band: FrameBand, Fill: FrameFill };
