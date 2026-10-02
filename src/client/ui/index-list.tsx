import type { ParentProps } from "solid-js";

// Rows of "label ······ value", like a table of contents.
function IndexListRoot(props: ParentProps) {
  return <ul class="m-0 grid list-none gap-1 p-0">{props.children}</ul>;
}

function IndexListRow(props: ParentProps) {
  return <li class="flex items-baseline">{props.children}</li>;
}

function IndexListLeader() {
  return (
    <span
      aria-hidden="true"
      class="mx-3 min-w-4 flex-1 -translate-y-[0.35em] border-b border-dotted border-line-strong"
    />
  );
}

function IndexListValue(props: ParentProps) {
  return <span class="shrink-0 text-faint tabular-nums">{props.children}</span>;
}

export const IndexList = {
  Root: IndexListRoot,
  Row: IndexListRow,
  Leader: IndexListLeader,
  Value: IndexListValue,
};
