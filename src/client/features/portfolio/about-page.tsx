import { Link } from "@tanstack/solid-router";
import { For } from "solid-js";
import { Facts } from "@/client/ui/facts";
import { LocalTime } from "@/client/ui/local-time";
import { Page, PageTitle, Paragraphs } from "@/client/ui/page";
import { portfolio_bio, profile } from "./portfolio.data";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";

export function AboutPage() {
  const locale = useLocale();
  const bio = () => portfolio_bio(locale());

  return (
    <Page class="max-w-[60ch]">
      <PageTitle>{profile.name}</PageTitle>
      <Facts.List>
        <Facts.Item label={m.fact_role({}, { locale: locale() })}>{bio().role}</Facts.Item>
        <Facts.Item label={m.fact_based({}, { locale: locale() })}>{bio().location}</Facts.Item>
        <Facts.Item label={m.fact_time({}, { locale: locale() })}>
          <LocalTime utcOffset={profile.utcOffset} />
        </Facts.Item>
        <Facts.Item label={m.fact_mail({}, { locale: locale() })}>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </Facts.Item>
      </Facts.List>
      <Paragraphs items={bio().about} />
      <p class="m-0">
        {m.about_more({}, { locale: locale() })}{" "}
        <Link to="/work">{m.nav_work({}, { locale: locale() })}</Link>,{" "}
        <Link to="/projects">{m.nav_projects({}, { locale: locale() })}</Link>;{" "}
        {m.about_find({}, { locale: locale() })} <ProfileLinks />
      </p>
    </Page>
  );
}

function ProfileLinks() {
  return (
    <For each={profile.links}>
      {(link, index) => (
        <>
          <a href={link.href}>{link.label}</a>
          {index() < profile.links.length - 1 ? ", " : "."}
        </>
      )}
    </For>
  );
}
