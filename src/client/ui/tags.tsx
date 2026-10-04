import type { ParentProps } from "solid-js";

function TagsList(props: ParentProps) {
  return <ul class="m-0 flex list-none flex-wrap gap-1.5 p-0">{props.children}</ul>;
}

function TagsItem(props: ParentProps) {
  return (
    <li class="inline-flex h-6 items-center border border-line px-1.5 text-xs text-muted">
      {props.children}
    </li>
  );
}

export const Tags = { List: TagsList, Item: TagsItem };
