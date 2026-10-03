import { For, Show, type ParentProps } from "solid-js";
import { Entry } from "@/client/ui/entry";
import { Facts } from "@/client/ui/facts";
import { IndexList } from "@/client/ui/index-list";
import { PageTitle } from "@/client/ui/page";
import { Tags } from "@/client/ui/tags";
import { site } from "@/shared/seo/site";
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
import type { Locale } from "@/paraglide/runtime";

// Source document for the generated résumé PDF; sized to an A4 sheet.
export function ResumePage() {
  const locale = useLocale();
  const bio = () => portfolio_bio(locale());
  const jobs = () => portfolio_jobs(locale());
  const skills = () => [
    ...new Set([...stack, ...jobs().flatMap((job) => job.stack)].map(resume_technology)),
  ];
  const links = profile.links.filter(
    (link) => link.label !== "Instagram" && new URL(link.href).pathname !== "/",
  );

  return (
    <main class="mx-auto grid max-w-[210mm] gap-6 px-4 py-[12mm] wrap-anywhere sm:px-[14mm] print:max-w-none print:gap-4 print:p-0">
      <header class="flex items-start justify-between gap-6">
        <div class="grid min-w-0 gap-3">
          <PageTitle>{profile.name}</PageTitle>
          <Facts.List>
            <Facts.Item label={m.fact_role({}, { locale: locale() })}>{bio().role}</Facts.Item>
            <Facts.Item label={m.fact_based({}, { locale: locale() })}>{bio().location}</Facts.Item>
            <Facts.Item label={m.fact_mail({}, { locale: locale() })}>
              <a href={`mailto:${profile.email}`}>
                <span class="hidden print:inline">{"\u00a0"}</span>
                {profile.email}
              </a>
            </Facts.Item>
            <Facts.Item label={m.fact_web({}, { locale: locale() })}>
              <a href={site.origin}>{new URL(site.origin).host}</a>
              <For each={links}>
                {(link) => (
                  <>
                    {", "}
                    <a href={link.href}>{resume_url(link.href)}</a>
                  </>
                )}
              </For>
            </Facts.Item>
          </Facts.List>
        </div>
        <span
          aria-hidden="true"
          class="grid size-9 shrink-0 place-items-center border border-line-strong text-xs font-bold"
        >
          FB
        </span>
      </header>

      <ResumeSection title={m.resume_summary({}, { locale: locale() })}>
        <p class="m-0">{m.resume_summary_text({}, { locale: locale() })}</p>
      </ResumeSection>

      <ResumeSection title={m.resume_stack({}, { locale: locale() })}>
        <Tags.List>
          <For each={skills()}>{(tech) => <ResumeTechnology value={tech} />}</For>
        </Tags.List>
      </ResumeSection>

      <ResumeSection title={m.resume_experience({}, { locale: locale() })}>
        <For each={jobs()}>
          {(job) => (
            <div class="break-inside-avoid">
              <Entry.Root>
                <Entry.Header>
                  <h3 class="m-0 text-sm font-bold">
                    <Show when={job.href} fallback={job.company}>
                      <a href={job.href}>{job.company}</a>
                    </Show>
                  </h3>
                  <Entry.Aside>{job.location}</Entry.Aside>
                </Entry.Header>
                <Entry.Subtitle>{job.role}</Entry.Subtitle>
                <div class="text-xs text-muted">
                  {job.type} | {resume_date(job.start, locale())} - {resume_date(job.end, locale())}
                </div>
                <Show when={job.bullets.length > 0}>
                  <Entry.Bullets>
                    <For each={job.bullets}>
                      {(bullet) => <Entry.Bullet>{bullet}</Entry.Bullet>}
                    </For>
                  </Entry.Bullets>
                </Show>
                <Show when={job.stack.length > 0}>
                  <Tags.List>
                    <For each={job.stack}>{(tech) => <ResumeTechnology value={tech} />}</For>
                  </Tags.List>
                </Show>
              </Entry.Root>
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
                  <Show when={project.href !== "#"}>
                    {" "}
                    <a href={project.href}>{resume_url(project.href)}</a>
                  </Show>
                </span>
                <IndexList.Leader />
                <IndexList.Value>
                  <span class="hidden print:inline">{"\u00a0"}</span>
                  {project.year}
                </IndexList.Value>
              </IndexList.Row>
            )}
          </For>
        </IndexList.Root>
      </ResumeSection>

      <ResumeSection title={m.resume_education({}, { locale: locale() })}>
        <For each={portfolio_education(locale())}>
          {(education) => (
            <div class="break-inside-avoid">
              <Entry.Root>
                <Entry.Header>
                  <h3 class="m-0 text-sm font-bold">{education.school}</h3>
                  <Entry.Aside>{education.years.replace("–", " - ")}</Entry.Aside>
                </Entry.Header>
                <Entry.Subtitle>{education.degree}</Entry.Subtitle>
              </Entry.Root>
            </div>
          )}
        </For>
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

function resume_date(value: string, locale: Locale) {
  if (value === "∞") return m.resume_present({}, { locale });
  const [month, year] = value.split(".").map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1)));
}

function resume_technology(value: string) {
  if (value === "Postgres") return "PostgreSQL";
  if (value === "Solid") return "SolidJS";
  return value;
}

function ResumeTechnology(props: { value: string }) {
  return (
    <Tags.Item>
      {resume_technology(props.value)}
      <span class="hidden print:inline">{"\u00a0"}</span>
    </Tags.Item>
  );
}

function resume_url(href: string) {
  const url = new URL(href, site.origin);
  return `${url.host}${url.pathname.replace(/\/$/, "")}${url.search}${url.hash}`;
}
