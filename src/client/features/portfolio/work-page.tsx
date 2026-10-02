import { For } from "solid-js";
import { Page, PageTitle } from "@/client/ui/page";
import { JobEntry } from "./job-entry";
import { jobs } from "./portfolio.data";

export function WorkPage() {
  return (
    <Page class="max-w-[64ch] gap-8">
      <PageTitle>Work</PageTitle>
      <For each={jobs}>{(job) => <JobEntry job={job} />}</For>
    </Page>
  );
}
