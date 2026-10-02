import { For, Show } from "solid-js";
import { Entry } from "@/client/ui/entry";
import { Tags } from "@/client/ui/tags";
import type { Job } from "./portfolio.data";

export function JobEntry(props: { job: Job }) {
  return (
    <Entry.Root>
      <Entry.Header>
        <Entry.Title>{props.job.company}</Entry.Title>
        <Entry.Aside>{props.job.location}</Entry.Aside>
      </Entry.Header>
      <Entry.Subtitle>{props.job.role}</Entry.Subtitle>
      <Entry.Meta>
        <span>{props.job.type}</span>
        <span>
          {props.job.start}–{props.job.end}
        </span>
        <span>{props.job.duration}</span>
      </Entry.Meta>
      <Show when={props.job.bullets.length > 0}>
        <Entry.Bullets>
          <For each={props.job.bullets}>{(bullet) => <Entry.Bullet>{bullet}</Entry.Bullet>}</For>
        </Entry.Bullets>
      </Show>
      <Show when={props.job.stack.length > 0}>
        <Tags.List>
          <For each={props.job.stack}>{(tech) => <Tags.Item>{tech}</Tags.Item>}</For>
        </Tags.List>
      </Show>
    </Entry.Root>
  );
}
