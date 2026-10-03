import { For } from "solid-js";
import { Page, PageTitle } from "@/client/ui/page";
import { portfolio_project_groups } from "./portfolio.data";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";

export function ProjectsPage() {
  const locale = useLocale();
  return (
    <Page class="gap-8">
      <PageTitle>{m.page_projects({}, { locale: locale() })}</PageTitle>
      <For each={portfolio_project_groups(locale())}>
        {(group) => (
          <section class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
            <h2 class="m-0 text-[10px] font-normal text-faint uppercase">{group.label}</h2>
            <ul class="m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-1 p-0">
              <For each={group.projects}>
                {(project) => (
                  <li>
                    <a
                      href={project.href}
                      class="group flex items-baseline gap-3 text-fg no-underline hover:no-underline"
                    >
                      <span class="shrink-0 font-bold underline-offset-3 group-hover:underline">
                        {project.name}
                      </span>
                      <span class="min-w-0 flex-1 truncate text-muted">{project.description}</span>
                      <span class="shrink-0 text-faint tabular-nums max-sm:hidden">
                        {project.year}
                      </span>
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
