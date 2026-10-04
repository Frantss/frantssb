import type { ParentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

// Label/value pairs with boxed labels.
function FactsList(props: ParentProps) {
  return <dl class="m-0 grid gap-1.5 text-xs text-muted">{props.children}</dl>;
}

function FactsItem(props: ParentProps<{ label: string; labelClass?: string }>) {
  return (
    <div class="flex gap-3">
      <dt
        class={cn(
          "grid w-12 shrink-0 place-items-center border border-line text-[10px] text-faint uppercase",
          props.labelClass,
        )}
      >
        {props.label}
      </dt>
      <dd class="m-0">{props.children}</dd>
    </div>
  );
}

export const Facts = { List: FactsList, Item: FactsItem };
