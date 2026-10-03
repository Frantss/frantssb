import { For, Show } from "solid-js";
import { Entry } from "@/client/ui/entry";
import { Tags } from "@/client/ui/tags";
import { useLocale } from "@/client/features/localization/locale.context";
import { JobDuration } from "./job-duration";
import type { Job } from "./portfolio.data";

export function JobEntry(props: { job: Job }) {
  const locale = useLocale();
  return (
    <Entry.Root>
      <Entry.Header>
        <Entry.Title>
          <Show when={props.job.href} fallback={props.job.company}>
            <a href={props.job.href}>{props.job.company}</a>
          </Show>
        </Entry.Title>
        <Entry.Aside>{props.job.location}</Entry.Aside>
      </Entry.Header>
      <Entry.Subtitle>{props.job.role}</Entry.Subtitle>
      <Entry.Meta>
        <span>{props.job.type}</span>
        <span>
          {props.job.start}–{props.job.end}
        </span>
        <JobDuration start={props.job.start} end={props.job.end} locale={locale()} />
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
