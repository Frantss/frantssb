import { For } from "solid-js";
import { Page, PageTitle } from "@/client/ui/page";
import { JobEntry } from "./job-entry";
import { portfolio_jobs } from "./portfolio.data";
import { m } from "@/paraglide/messages";

export function WorkPage() {
  return (
    <Page class="max-w-[64ch] gap-8">
      <PageTitle>{m.page_work()}</PageTitle>
      <For each={portfolio_jobs()}>{(job) => <JobEntry job={job} />}</For>
    </Page>
  );
}
