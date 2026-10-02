import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

const base =
  "inline-flex h-11 items-center px-2 font-bold whitespace-nowrap no-underline sm:h-[34px]";

function ButtonLinkSolid(props: ComponentProps<"a">) {
  const [local, rest] = splitProps(props, ["class"]);
  return <a {...rest} class={cn(base, "bg-accent text-on-accent", local.class)} />;
}

function ButtonLinkOutline(props: ComponentProps<"a">) {
  const [local, rest] = splitProps(props, ["class"]);
  return <a {...rest} class={cn(base, "border border-accent text-fg", local.class)} />;
}

export const ButtonLink = { Solid: ButtonLinkSolid, Outline: ButtonLinkOutline };
