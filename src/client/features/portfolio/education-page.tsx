import { For, Show } from "solid-js";
import { Entry } from "@/client/ui/entry";
import { Page, PageTitle } from "@/client/ui/page";
import { m } from "@/paraglide/messages";
import { portfolio_education } from "./portfolio.data";

export function EducationPage() {
  return (
    <Page class="max-w-[64ch] gap-8 wrap-anywhere">
      <PageTitle>{m.page_education()}</PageTitle>
      <For each={portfolio_education()}>
        {(education) => (
          <Entry.Root>
            <Entry.Header>
              <Entry.Title>{education.school}</Entry.Title>
              <Entry.Aside>{education.years}</Entry.Aside>
            </Entry.Header>
            <Entry.Subtitle>{education.degree}</Entry.Subtitle>
            <Entry.Meta>
              <span>{education.level ?? education.field}</span>
            </Entry.Meta>
            <Show when={education.description}>
              <p class="m-0 text-muted">{education.description}</p>
            </Show>
          </Entry.Root>
        )}
      </For>
    </Page>
  );
}
