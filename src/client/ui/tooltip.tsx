import { createEffect, createMemo, createUniqueId, onCleanup, Show, type JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { mergeProps, normalizeProps, useMachine, type PropTypes } from "@zag-js/solid";
import * as tooltip from "@zag-js/tooltip";

export function Tooltip(props: {
  label: string;
  children: (triggerProps: PropTypes["element"]) => JSX.Element;
}) {
  const service = useMachine(tooltip.machine, {
    id: createUniqueId(),
    interactive: true,
    closeOnEscape: false,
    positioning: { placement: "bottom", strategy: "fixed", gutter: 8 },
  });
  const api = createMemo(() => tooltip.connect(service, normalizeProps));
  const triggerProps = mergeProps(() => api().getTriggerProps());

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
    <>
      {props.children(triggerProps)}
      <Show when={api().open}>
        {/* Keep dock tooltips in the native popover's top layer. */}
        <Portal
          mount={document.getElementById(triggerProps.id!)?.closest("[popover]") ?? document.body}
        >
          <div {...api().getPositionerProps()} class="z-30">
            <div
              {...api().getArrowProps()}
              aria-hidden="true"
              class="[--arrow-size:6px] [--arrow-background:var(--fg)]"
            >
              <div {...api().getArrowTipProps()} class="border-t border-l border-line-strong" />
            </div>
            <div
              {...api().getContentProps()}
              class="max-w-[min(32ch,calc(100vw-1rem))] border border-line-strong bg-fg px-2 py-1 text-xs text-bg"
            >
              {props.label}
            </div>
          </div>
        </Portal>
      </Show>
    </>
  );
}
