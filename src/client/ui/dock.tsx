import { createLink } from "@tanstack/solid-router";
import {
  createContext,
  createUniqueId,
  splitProps,
  useContext,
  type ComponentProps,
  type ParentProps,
} from "solid-js";
import { cn } from "@/client/lib/cn";

// Small-screen navigation: a bar fixed to the bottom edge whose trigger opens a sheet above it.
// The sheet is a native popover, so it opens, light-dismisses, and closes on Escape without JS;
// an in-flow spacer reserves the bar's height so it never covers the end of the page.
const DockContext = createContext<{ sheetId: string }>();

function useDock() {
  const context = useContext(DockContext);
  if (!context) throw new Error("Dock parts must be rendered inside Dock.Root");
  return context;
}

const barHeight = "h-[calc(3rem+env(safe-area-inset-bottom))]";

function DockRoot(props: ParentProps) {
  const sheetId = createUniqueId();
  return (
    <DockContext.Provider value={{ sheetId }}>
      <div class="group sm:hidden">
        <div class={barHeight} aria-hidden="true" />
        {props.children}
      </div>
    </DockContext.Provider>
  );
}

function DockBar(props: ParentProps) {
  return (
    <div
      class={cn(
        "fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)]",
        barHeight,
      )}
    >
      {props.children}
    </div>
  );
}

function DockTrigger(props: ParentProps<{ menuLabel: string; closeLabel: string }>) {
  const dock = useDock();
  return (
    <button
      type="button"
      popoverTarget={dock.sheetId}
      class="flex h-full w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent px-4 font-[inherit] text-fg"
    >
      <span>{props.children}</span>
      <span class="text-muted group-has-[:popover-open]:hidden">{props.menuLabel} ≡</span>
      <span class="hidden text-muted group-has-[:popover-open]:inline">{props.closeLabel} ×</span>
    </button>
  );
}

// Following a link closes the sheet; client-side navigation would otherwise leave it open.
function DockSheet(props: ParentProps<{ label: string }>) {
  const dock = useDock();
  return (
    <nav
      id={dock.sheetId}
      popover
      aria-label={props.label}
      onClick={(event) => {
        if ((event.target as Element).closest("a")) event.currentTarget.hidePopover();
      }}
      class={cn(
        "inset-x-0 top-auto bottom-[calc(3rem+env(safe-area-inset-bottom))] m-0 w-full max-w-none border-0 border-t border-line bg-bg px-4 py-2 text-fg",
        // Slides out from behind the bar: the clip hides whatever is translated past the bar's edge.
        // Display and overlay transition discretely so closing animates too.
        "translate-y-full [clip-path:inset(0_0_100%_0)] transition-[translate,clip-path,display,overlay] transition-discrete duration-250 ease-out open:translate-y-0 open:[clip-path:inset(0_0_0_0)] starting:open:translate-y-full starting:open:[clip-path:inset(0_0_100%_0)] motion-reduce:transition-none",
      )}
    >
      {props.children}
    </nav>
  );
}

function DockList(props: ParentProps) {
  return <ul class="m-0 grid list-none p-0">{props.children}</ul>;
}

// The router sets aria-current on the active link; styling keys off it.
function DockAnchor(props: ComponentProps<"a">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <li>
      <a
        {...rest}
        class={cn(
          "block py-3 text-faint no-underline hover:text-muted aria-[current=page]:text-fg aria-[current=page]:before:content-['▸_']",
          local.class,
        )}
      />
    </li>
  );
}

function DockFooter(props: ParentProps) {
  return (
    <div class="flex items-center justify-end gap-2 border-t border-line py-2">
      {props.children}
    </div>
  );
}

export const Dock = {
  Root: DockRoot,
  Bar: DockBar,
  Trigger: DockTrigger,
  Sheet: DockSheet,
  List: DockList,
  Link: createLink(DockAnchor),
  Footer: DockFooter,
};
