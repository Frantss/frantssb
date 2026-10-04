import { For, Show } from "solid-js";
import { IconLink } from "@tabler/icons-solidjs";
import { links_openInNewTab } from "@/client/lib/links";
import { Entry } from "@/client/ui/entry";
import { Tags } from "@/client/ui/tags";
import { m } from "@/paraglide/messages";
import { JobDuration } from "./job-duration";
import type { Job } from "./portfolio.data";

export function JobEntry(props: { job: Job }) {
  const id = () =>
    `${props.job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${props.job.start.replace(".", "-")}`;

  return (
    <Entry.Root id={id()} class="scroll-mt-6">
      <Entry.Header>
        <Entry.Title>
          <span class="inline-flex items-center gap-2">
            <Show when={props.job.href} fallback={props.job.company}>
              <a href={props.job.href} {...links_openInNewTab}>
                {props.job.company}
              </a>
            </Show>
            <a
              href={`#${id()}`}
              aria-label={`${props.job.company} · ${props.job.role} · ${props.job.start}`}
              class="grid size-11 shrink-0 place-items-center text-faint hover:text-fg focus-visible:text-fg sm:size-5"
            >
              <IconLink size={14} aria-hidden="true" />
            </a>
          </span>
        </Entry.Title>
        <Entry.Aside>{props.job.location}</Entry.Aside>
      </Entry.Header>
      <Entry.Subtitle>{props.job.role}</Entry.Subtitle>
      <Entry.Meta>
        <span>{props.job.type}</span>
        <span>
          {props.job.start}–{props.job.end === "∞" ? m.job_present() : props.job.end}
        </span>
        <JobDuration start={props.job.start} end={props.job.end} />
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
