import type { ParentProps } from "solid-js";

// Boxed cells sharing single 1px borders; one column on small screens, two above.
function CellGridRoot(props: ParentProps) {
  return (
    <ul class="m-0 grid list-none border-t border-l border-line-strong p-0 sm:grid-cols-2">
      {props.children}
    </ul>
  );
}

function CellGridCell(props: ParentProps) {
  return <li class="border-r border-b border-line-strong">{props.children}</li>;
}

export const CellGrid = { Root: CellGridRoot, Cell: CellGridCell };
