import { createEffect, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { Tooltip as ArkTooltip, useTooltip, type TooltipTriggerProps } from "@ark-ui/solid/tooltip";

export function Tooltip(props: {
  label: string;
  children: NonNullable<TooltipTriggerProps["asChild"]>;
}) {
  const api = useTooltip({
    interactive: true,
    closeOnEscape: false,
    positioning: { placement: "bottom", strategy: "fixed", gutter: 8 },
  });

  createEffect(() => {
    if (!api().open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing) return;
      // Cancel native popover dismissal so Escape closes only the tooltip.
      event.preventDefault();
      event.stopPropagation();
      api().setOpen(false);
    };
    document.addEventListener("keydown", dismiss, true);
    onCleanup(() => document.removeEventListener("keydown", dismiss, true));
  });

  return (
    <ArkTooltip.RootProvider value={api}>
      <ArkTooltip.Trigger asChild={props.children} />
      <Show when={api().open}>
        {/* Keep dock tooltips in the native popover's top layer. */}
        <Portal
          mount={
            document.getElementById(api().getTriggerProps().id!)?.closest("[popover]") ??
            document.body
          }
        >
          <ArkTooltip.Positioner class="z-30">
            <ArkTooltip.Arrow
              aria-hidden="true"
              class="[--arrow-size:6px] [--arrow-background:var(--fg)]"
            >
              <ArkTooltip.ArrowTip class="border-t border-l border-line-strong" />
            </ArkTooltip.Arrow>
            <ArkTooltip.Content class="max-w-[min(32ch,calc(100vw-1rem))] border border-line-strong bg-fg px-2 py-1 text-xs text-bg">
              {props.label}
            </ArkTooltip.Content>
          </ArkTooltip.Positioner>
        </Portal>
      </Show>
    </ArkTooltip.RootProvider>
  );
}
