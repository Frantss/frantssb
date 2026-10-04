import { For, Show, type JSX, type ParentProps } from "solid-js";
import { links_openInNewTab } from "@/client/lib/links";
import { Entry } from "@/client/ui/entry";
import { Facts } from "@/client/ui/facts";
import { IndexList } from "@/client/ui/index-list";
import { PageTitle } from "@/client/ui/page";
import { site } from "@/shared/seo/site";
import {
  portfolio_bio,
  portfolio_education,
  portfolio_jobs,
  portfolio_skills,
  profile,
  type Job,
} from "./portfolio.data";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

// Source document for the generated résumé PDF; sized to fit one A4 sheet.
export function ResumePage() {
  const bio = () => portfolio_bio();
  const jobs = () => portfolio_jobs();
  const job = (company: string, role: string) =>
    jobs().find((item) => item.company === company && item.role === role)!;
  const guildara = () => job("Guildara", m.job_product_engineer());
  const qubikaLead = () => job("Qubika", m.job_technical_leader());
  const qubikaDev = () => job("Qubika", m.job_fullstack());
  const hulu = () => job("Hulu", m.job_fullstack());
  const datum = () => job("Datum Source", m.job_react_fullstack());
  const earlier = () => [
    job("Senpai Academy", m.job_fullstack_teacher()),
    job("ST Consultores", m.job_java()),
  ];
  const education = () => portfolio_education();
  const links = profile.links.filter(
    (link) => ["github", "linkedin"].includes(link.platform) && new URL(link.href).pathname !== "/",
  );

  return (
    <main class="mx-auto grid max-w-[210mm] gap-6 px-4 py-[12mm] wrap-anywhere sm:px-[14mm] print:max-w-none print:gap-3 print:p-0 print:text-[11px]">
      <header class="flex items-start justify-between gap-6">
        <div class="grid min-w-0 gap-3">
          <PageTitle>{profile.name}</PageTitle>
          <Facts.List>
            <Facts.Item label={m.fact_role()}>{bio().role}</Facts.Item>
            <Facts.Item label={m.fact_based()}>
              {bio().location.replace(/^\P{L}+/u, "")} (UTC{profile.utcOffset})
            </Facts.Item>
            <Facts.Item label={m.fact_mail()}>
              <a href={`mailto:${profile.email}`}>
                <span class="hidden print:absolute print:inline">{" "}</span>
                {profile.email}
              </a>
            </Facts.Item>
            <Facts.Item label={m.fact_web()}>
              <a href={site.origin}>{new URL(site.origin).host}</a>
              <For each={links}>
                {(link) => (
                  <>
                    {", "}
                    <a href={link.href} {...links_openInNewTab}>
                      {resume_url(link.href)}
                    </a>
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

      <ResumeSection title={m.resume_summary()}>
        <p class="m-0">{m.resume_summary_text()}</p>
      </ResumeSection>

      <ResumeSection title={m.resume_experience()}>
        <div class="grid gap-4 print:gap-2.5">
          <ResumeJob
            job={guildara()}
            role={guildara().role}
            meta={`${guildara().type} · ${resume_dates(guildara())}`}
            bullets={[m.resume_guildara_typescript(), m.resume_guildara_codebase()]}
          />
          <ResumeJob
            job={qubikaDev()}
            role={`${qubikaLead().role} (${resume_dates(qubikaLead())}) · ${qubikaDev().role}`}
            meta={`${qubikaDev().type} · ${resume_dates(qubikaDev())}`}
            bullets={[
              m.job_qubika_architecture(),
              m.resume_qubika_leadership(),
              m.resume_qubika_development(),
              <ResumeClient job={hulu()} text={m.resume_hulu()} />,
              <ResumeClient job={datum()} text={m.resume_datum()} />,
            ]}
          />
          <p class="m-0 text-xs text-muted">
            <span class="font-bold text-fg">{m.resume_earlier()}:</span>{" "}
            {earlier()
              .map(
                (item) =>
                  `${item.role}${item.type === m.job_part_time() ? ` (${item.type.toLowerCase()})` : ""}, ${item.company} (${resume_dates(item)})`,
              )
              .join(" · ")}
          </p>
        </div>
      </ResumeSection>

      <ResumeSection title={m.resume_stack()}>
        <Facts.List>
          <For each={portfolio_skills()}>
            {(group) => (
              <Facts.Item label={group.label} labelClass="w-30 text-[9px]">
                {group.items.join(", ")}
              </Facts.Item>
            )}
          </For>
        </Facts.List>
      </ResumeSection>

      <ResumeSection title={m.page_projects()}>
        <ul class="m-0 grid list-none gap-1 p-0 text-muted print:gap-0.5">
          <ResumeProject name="safeish" href="https://github.com/Frantss/safeish">
            {m.project_safeish_description()}
          </ResumeProject>
          <ResumeProject name="oxform" href="https://github.com/Frantss/oxform">
            {m.project_oxform_description()}
          </ResumeProject>
          <li>
            <span class="font-bold text-fg">{m.resume_client_websites()}</span>{" "}
            <a href="https://altereco.com.uy" {...links_openInNewTab}>
              altereco.com.uy
            </a>{" "}
            ({m.resume_altereco()}),{" "}
            <a href="https://atenea-coffee.com" {...links_openInNewTab}>
              atenea-coffee.com
            </a>{" "}
            ({m.resume_atenea()}).
          </li>
        </ul>
      </ResumeSection>

      <ResumeSection title={m.resume_education()}>
        <IndexList.Root>
          <ResumeEducation
            title={education()[0].degree}
            detail={education()[0].school}
            year="2022"
          />
          <ResumeEducation
            title={m.resume_erasmus()}
            detail={`${education()[1].school}, ${m.resume_poland()}`}
            year="2019"
          />
          <ResumeEducation
            title={education()[3].degree}
            detail={education()[3].school}
            year="2018"
          />
        </IndexList.Root>
      </ResumeSection>
    </main>
  );
}

function ResumeSection(props: ParentProps<{ title: string }>) {
  return (
    <section class="grid gap-4 border-t border-line pt-4 print:gap-2 print:pt-2.5">
      <h2 class="m-0 text-[10px] font-normal text-faint uppercase break-after-avoid">
        {props.title}
      </h2>
      {props.children}
    </section>
  );
}

function ResumeJob(props: { job: Job; role: string; meta: string; bullets: JSX.Element[] }) {
  return (
    <div class="break-inside-avoid">
      <Entry.Root class="gap-1 print:gap-0.5">
        <Entry.Header>
          <h3 class="m-0 text-sm font-bold">
            <Show when={props.job.href} fallback={props.job.company}>
              <a href={props.job.href} {...links_openInNewTab}>
                {props.job.company}
              </a>
            </Show>
          </h3>
          <Entry.Aside>{props.job.location}</Entry.Aside>
        </Entry.Header>
        <Entry.Subtitle>
          {props.role}
          <span class="text-xs text-muted"> · {props.meta}</span>
        </Entry.Subtitle>
        <Entry.Bullets>
          <For each={props.bullets}>{(bullet) => <Entry.Bullet>{bullet}</Entry.Bullet>}</For>
        </Entry.Bullets>
      </Entry.Root>
    </div>
  );
}

function ResumeClient(props: { job: Job; text: string }) {
  return (
    <>
      <span class="font-bold text-fg">
        {m.resume_client()}: {props.job.company}
      </span>{" "}
      ({resume_dates(props.job)}) — {props.text}
    </>
  );
}

function ResumeProject(props: ParentProps<{ name: string; href: string }>) {
  return (
    <li>
      <span class="font-bold text-fg">{props.name}</span> {props.children}{" "}
      <a href={props.href} {...links_openInNewTab}>
        {resume_url(props.href)}
      </a>
    </li>
  );
}

function ResumeEducation(props: { title: string; detail: string; year: string }) {
  return (
    <IndexList.Row>
      <span>
        <span class="font-bold">{props.title}</span> <span class="text-muted">{props.detail}</span>
      </span>
      <IndexList.Leader />
      <IndexList.Value>
        <span class="hidden print:inline">{" "}</span>
        {props.year}
      </IndexList.Value>
    </IndexList.Row>
  );
}

function resume_dates(job: Job) {
  return `${resume_date(job.start)} - ${resume_date(job.end)}`;
}

function resume_date(value: string) {
  if (value === "∞") return m.resume_present();
  const [month, year] = value.split(".").map(Number);

  return new Intl.DateTimeFormat(getLocale(), {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1)));
}

function resume_url(href: string) {
  const url = new URL(href, site.origin);

  return `${url.host}${url.pathname.replace(/\/$/, "")}${url.search}${url.hash}`;
}
