import { For, type ParentProps } from "solid-js";
import { Entry } from "@/client/ui/entry";
import { Facts } from "@/client/ui/facts";
import { IndexList } from "@/client/ui/index-list";
import { PageTitle, Paragraphs } from "@/client/ui/page";
import { Tags } from "@/client/ui/tags";
import { site } from "@/shared/seo/site";
import { JobEntry } from "./job-entry";
import {
  portfolio_bio,
  portfolio_education,
  portfolio_jobs,
  portfolio_projects,
  profile,
  stack,
} from "./portfolio.data";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";

// Source document for the generated résumé PDF; sized to an A4 sheet.
export function ResumePage() {
  const locale = useLocale();
  const bio = () => portfolio_bio(locale());

  return (
    <main class="mx-auto grid max-w-[210mm] gap-6 px-4 py-[12mm] sm:px-[14mm] print:max-w-none print:gap-4 print:p-0">
      <header class="flex items-start justify-between gap-6">
        <div class="grid gap-3">
          <PageTitle>{profile.name}</PageTitle>
          <Facts.List>
            <Facts.Item label={m.fact_role({}, { locale: locale() })}>{bio().role}</Facts.Item>
            <Facts.Item label={m.fact_based({}, { locale: locale() })}>{bio().location}</Facts.Item>
            <Facts.Item label={m.fact_mail({}, { locale: locale() })}>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </Facts.Item>
            <Facts.Item label={m.fact_web({}, { locale: locale() })}>
              <a href={site.origin}>{new URL(site.origin).host}</a>
              <For each={profile.links.filter((link) => link.label !== "Instagram")}>
                {(link) => (
                  <>
                    {", "}
                    <a href={link.href}>{link.label}</a>
                  </>
                )}
              </For>
            </Facts.Item>
          </Facts.List>
        </div>
        <span class="grid size-9 shrink-0 place-items-center border border-line-strong text-xs font-bold">
          FB
        </span>
      </header>

      <ResumeSection title={m.nav_about({}, { locale: locale() })}>
        <Paragraphs items={bio().about} />
      </ResumeSection>

      <ResumeSection title={m.page_work({}, { locale: locale() })}>
        <For each={portfolio_jobs(locale())}>
          {(job) => (
            <div class="break-inside-avoid">
              <JobEntry job={job} />
            </div>
          )}
        </For>
      </ResumeSection>

      <ResumeSection title={m.page_projects({}, { locale: locale() })}>
        <IndexList.Root>
          <For each={portfolio_projects(locale())}>
            {(project) => (
              <IndexList.Row>
                <span>
                  <span class="font-bold">{project.name}</span>{" "}
                  <span class="text-muted">{project.description}</span>
                </span>
                <IndexList.Leader />
                <IndexList.Value>{project.year}</IndexList.Value>
              </IndexList.Row>
            )}
          </For>
        </IndexList.Root>
      </ResumeSection>

      <ResumeSection title={m.resume_education({}, { locale: locale() })}>
        <For each={portfolio_education(locale())}>
          {(education) => (
            <Entry.Root>
              <Entry.Header>
                <Entry.Title>{education.school}</Entry.Title>
                <Entry.Aside>{education.years}</Entry.Aside>
              </Entry.Header>
              <Entry.Subtitle>{education.degree}</Entry.Subtitle>
            </Entry.Root>
          )}
        </For>
      </ResumeSection>

      <ResumeSection title={m.resume_stack({}, { locale: locale() })}>
        <Tags.List>
          <For each={stack}>{(tech) => <Tags.Item>{tech}</Tags.Item>}</For>
        </Tags.List>
      </ResumeSection>
    </main>
  );
}

function ResumeSection(props: ParentProps<{ title: string }>) {
  return (
    <section class="grid gap-4 border-t border-line pt-4 print:gap-3 print:pt-3">
      <h2 class="m-0 text-[10px] font-normal text-faint uppercase break-after-avoid">
        {props.title}
      </h2>
      {props.children}
    </section>
  );
}
