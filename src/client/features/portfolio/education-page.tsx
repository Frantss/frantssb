import { For, Show } from "solid-js";
import { useLocale } from "@/client/features/localization/locale.context";
import { Entry } from "@/client/ui/entry";
import { Page, PageTitle } from "@/client/ui/page";
import { m } from "@/paraglide/messages";
import { portfolio_education } from "./portfolio.data";

export function EducationPage() {
  const locale = useLocale();
  return (
    <Page class="max-w-[64ch] gap-8 wrap-anywhere">
      <PageTitle>{m.page_education({}, { locale: locale() })}</PageTitle>
      <For each={portfolio_education(locale())}>
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
