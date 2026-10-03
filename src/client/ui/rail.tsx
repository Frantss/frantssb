import { createLink } from "@tanstack/solid-router";
import { splitProps, type ComponentProps, type ParentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

// Sidebar navigation beside a content column; hidden on small screens, where Dock takes over.
function RailRoot(props: ParentProps) {
  return (
    <div class="grid flex-1 content-start sm:grid-cols-[9rem_1fr] sm:content-stretch">
      {props.children}
    </div>
  );
}

function RailNav(props: ParentProps<{ label: string }>) {
  return (
    <nav aria-label={props.label} class="border-r border-line px-4 py-6 max-sm:hidden">
      <ul class="sticky top-6 m-0 flex list-none flex-col items-end gap-1 p-0">{props.children}</ul>
    </nav>
  );
}

// The router sets aria-current on the active link; styling keys off it.
function RailAnchor(props: ComponentProps<"a">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <li class="whitespace-nowrap">
      <a
        {...rest}
        class={cn(
          "text-faint no-underline hover:text-muted aria-[current=page]:text-fg aria-[current=page]:before:content-['▸_']",
          local.class,
        )}
      />
    </li>
  );
}

function RailContent(props: ParentProps) {
  return <main class="px-4 py-6 sm:px-8">{props.children}</main>;
}

export const Rail = {
  Root: RailRoot,
  Nav: RailNav,
  Link: createLink(RailAnchor),
  Content: RailContent,
};
