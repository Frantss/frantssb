import { For, Match, Switch } from "solid-js";
import { IconBrandOpenSource, IconBriefcase, IconDots } from "@tabler/icons-solidjs";
import { Page, PageTitle } from "@/client/ui/page";
import { portfolio_project_groups } from "./portfolio.data";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";
import { analytics_capture } from "@/client/analytics/analytics";

export function ProjectsPage() {
  const locale = useLocale();
  return (
    <Page class="gap-8">
      <PageTitle>{m.page_projects({}, { locale: locale() })}</PageTitle>
      <For each={portfolio_project_groups(locale())}>
        {(group) => (
          <section class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
            <h2 class="m-0 flex items-center gap-2 text-[10px] font-normal text-faint uppercase">
              <Switch>
                <Match when={group.kind === "oss"}>
                  <IconBrandOpenSource size={14} aria-hidden="true" class="shrink-0 text-muted" />
                </Match>
                <Match when={group.kind === "client"}>
                  <IconBriefcase size={14} aria-hidden="true" class="shrink-0 text-muted" />
                </Match>
                <Match when={group.kind === "misc"}>
                  <IconDots size={14} aria-hidden="true" class="shrink-0 text-muted" />
                </Match>
              </Switch>
              {group.label}
            </h2>
            <ul class="m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-4 p-0">
              <For each={group.projects}>
                {(project) => (
                  <li>
                    <a
                      href={project.href}
                      onClick={() =>
                        analytics_capture("project_clicked", {
                          locale: locale(),
                          project_id: project.name,
                          project_kind: project.kind,
                        })
                      }
                      class="group grid gap-1 text-fg no-underline hover:no-underline"
                    >
                      <span class="flex items-baseline justify-between gap-3">
                        <span class="min-w-0 font-bold break-words underline-offset-3 group-hover:underline">
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
