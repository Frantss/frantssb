import type { ParentProps } from "solid-js";

// Rows of "label ······ value", like a table of contents; on small screens the value sits
// under the label.
function IndexListRoot(props: ParentProps) {
  return <ul class="m-0 grid list-none gap-3 p-0 sm:gap-1">{props.children}</ul>;
}

function IndexListRow(props: ParentProps) {
  return <li class="flex flex-col sm:flex-row sm:items-baseline">{props.children}</li>;
}

function IndexListLeader() {
  return (
    <span
      aria-hidden="true"
      class="mx-3 min-w-4 flex-1 max-sm:hidden -translate-y-[0.35em] border-b border-dotted border-line-strong"
    />
  );
}

function IndexListValue(props: ParentProps) {
  return <span class="shrink-0 text-faint tabular-nums max-sm:text-xs">{props.children}</span>;
}

export const IndexList = {
  Root: IndexListRoot,
  Row: IndexListRow,
  Leader: IndexListLeader,
  Value: IndexListValue,
};
