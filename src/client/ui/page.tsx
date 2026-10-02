import { For, type ParentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

// Vertical rhythm for a page body.
export function Page(props: ParentProps<{ class?: string }>) {
  return <div class={cn("page-content grid gap-5", props.class)}>{props.children}</div>;
}

export function PageTitle(props: ParentProps) {
  return <h1 class="m-0 border-l-2 border-accent pl-3 text-sm font-bold">{props.children}</h1>;
}

export function Paragraphs(props: { items: string[] }) {
  return <For each={props.items}>{(paragraph) => <p class="m-0">{paragraph}</p>}</For>;
}
