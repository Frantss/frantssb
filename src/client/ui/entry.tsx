import type { ParentProps } from "solid-js";

// A titled record (job, role, education): header row, subtitle, meta line, bullets.
function EntryRoot(props: ParentProps) {
  return <article class="grid gap-2">{props.children}</article>;
}

function EntryHeader(props: ParentProps) {
  return <div class="flex flex-wrap items-baseline justify-between gap-x-4">{props.children}</div>;
}

function EntryTitle(props: ParentProps) {
  return <h2 class="m-0 text-sm font-bold">{props.children}</h2>;
}

function EntryAside(props: ParentProps) {
  return <span class="text-xs text-faint">{props.children}</span>;
}

function EntrySubtitle(props: ParentProps) {
  return <div>{props.children}</div>;
}

// Children are separated by a faint pipe.
function EntryMeta(props: ParentProps) {
  return (
    <div class="flex flex-wrap text-xs text-muted [&>*+*]:before:mx-1.5 [&>*+*]:before:text-faint [&>*+*]:before:content-['|']">
      {props.children}
    </div>
  );
}

function EntryBullets(props: ParentProps) {
  return <ul class="m-0 grid list-none gap-1 p-0 text-muted">{props.children}</ul>;
}

function EntryBullet(props: ParentProps) {
  return (
    <li class="flex gap-2">
      <span class="text-accent" aria-hidden="true">
        ›
      </span>
      <span>{props.children}</span>
    </li>
  );
}

export const Entry = {
  Root: EntryRoot,
  Header: EntryHeader,
  Title: EntryTitle,
  Aside: EntryAside,
  Subtitle: EntrySubtitle,
  Meta: EntryMeta,
  Bullets: EntryBullets,
  Bullet: EntryBullet,
};
