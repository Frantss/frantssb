import { For, Match, Switch } from "solid-js";
import { IconBrandOpenSource, IconBriefcase, IconCode, IconDots } from "@tabler/icons-solidjs";
import { links_openInNewTab } from "@/client/lib/links";
import { Page, PageTitle } from "@/client/ui/page";
import { portfolio_project_groups } from "./portfolio.data";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { analytics_capture } from "@/client/analytics/analytics";

export function ProjectsPage() {
  return (
    <Page class="gap-8">
      <PageTitle>{m.page_projects()}</PageTitle>
      <For each={portfolio_project_groups()}>
        {(group) => (
          <section id={group.kind} class="grid min-w-0 scroll-mt-6 grid-cols-[minmax(0,1fr)] gap-3">
            <h2
              id={group.kind === "misc" ? "miscellaneous" : undefined}
              class="m-0 text-[10px] font-normal uppercase"
            >
              <a
                href={`#${group.kind}`}
                class="group flex min-h-11 w-fit items-center gap-2 text-faint hover:text-fg focus-visible:text-fg sm:min-h-0"
              >
                <Switch>
                  <Match when={group.kind === "oss"}>
                    <IconBrandOpenSource
                      size={14}
                      aria-hidden="true"
                      class="shrink-0 text-muted transition-colors group-hover:text-fg group-focus-visible:text-fg"
                    />
                  </Match>
                  <Match when={group.kind === "client"}>
                    <IconBriefcase
                      size={14}
                      aria-hidden="true"
                      class="shrink-0 text-muted transition-colors group-hover:text-fg group-focus-visible:text-fg"
                    />
                  </Match>
                  <Match when={group.kind === "snippets"}>
                    <IconCode size={14} aria-hidden="true" class="shrink-0 text-muted" />
                  </Match>
                  <Match when={group.kind === "misc"}>
                    <IconDots
                      size={14}
                      aria-hidden="true"
                      class="shrink-0 text-muted transition-colors group-hover:text-fg group-focus-visible:text-fg"
                    />
                  </Match>
                </Switch>
                {group.label}
              </a>
            </h2>
            <ul class="m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-4 p-0">
              <For each={group.projects}>
                {(project) => (
                  <li>
                    <a
                      href={project.href}
                      {...links_openInNewTab}
                      onClick={() =>
                        analytics_capture("project_clicked", {
                          locale: getLocale(),
                          project_id: project.name,
                          project_kind: project.kind,
                        })
                      }
                      class="group grid gap-1 text-fg no-underline"
                    >
                      <span class="flex items-baseline justify-between gap-3">
                        <span class="min-w-0 font-bold break-words transition-colors group-hover:text-link group-focus-visible:text-link">
                          {project.name}
                        </span>
                        <span class="shrink-0 text-xs text-faint tabular-nums">{project.year}</span>
                      </span>
                      <span class="text-xs text-muted">{project.description}</span>
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </section>
        )}
      </For>
    </Page>
  );
}
