import { For } from "solid-js";
import { Page, PageTitle } from "@/client/ui/page";
import { JobEntry } from "./job-entry";
import { portfolio_jobs } from "./portfolio.data";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";

export function WorkPage() {
  const locale = useLocale();
  return (
    <Page class="max-w-[64ch] gap-8">
      <PageTitle>{m.page_work({}, { locale: locale() })}</PageTitle>
      <For each={portfolio_jobs(locale())}>{(job) => <JobEntry job={job} />}</For>
    </Page>
  );
}
