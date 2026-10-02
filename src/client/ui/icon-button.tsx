import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

// Square control sized to match ButtonLink; callers provide an aria-label.
export function IconButton(props: ComponentProps<"button"> & { "aria-label": string }) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <button
      type="button"
      {...rest}
      class={cn(
        "grid size-[34px] cursor-pointer place-items-center border border-line-strong bg-transparent p-0 font-[inherit] text-muted hover:text-fg",
        local.class,
      )}
    />
  );
}
