import { For } from "solid-js";
import { CellGrid } from "@/client/ui/cell-grid";
import { Page, PageTitle } from "@/client/ui/page";
import { portfolio_projects } from "./portfolio.data";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";

export function ProjectsPage() {
  const locale = useLocale();
  return (
    <Page>
      <PageTitle>{m.page_projects({}, { locale: locale() })}</PageTitle>
      <CellGrid.Root>
        <For each={portfolio_projects(locale())}>
          {(project) => (
            <CellGrid.Cell>
              <a
                href={project.href}
                class="grid h-full gap-2 p-4 text-fg sm:p-5 no-underline hover:bg-surface"
              >
                <span class="flex justify-between gap-4">
                  <span class="font-bold">{project.name}</span>
                  <span class="text-xs text-faint">{project.year}</span>
                </span>
                <span class="text-muted">{project.description}</span>
              </a>
            </CellGrid.Cell>
          )}
        </For>
      </CellGrid.Root>
    </Page>
  );
}
