import { For } from "solid-js";
import { CellGrid } from "@/client/ui/cell-grid";
import { Page, PageTitle } from "@/client/ui/page";
import { projects } from "./portfolio.data";

export function ProjectsPage() {
  return (
    <Page>
      <PageTitle>Projects</PageTitle>
      <CellGrid.Root>
        <For each={projects}>
          {(project) => (
            <CellGrid.Cell>
              <a
                href={project.href}
                class="grid h-full gap-2 p-5 text-fg no-underline hover:bg-surface"
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
