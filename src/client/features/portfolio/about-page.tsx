import { Link } from "@tanstack/solid-router";
import type { ParentProps } from "solid-js";
import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-solidjs";
import { Facts } from "@/client/ui/facts";
import { links_openInNewTab } from "@/client/lib/links";
import { IconLink } from "@/client/ui/icon-link";
import { Tooltip } from "@/client/ui/tooltip";
import { LocalTime } from "@/client/ui/local-time";
import { Page, PageTitle, Paragraphs } from "@/client/ui/page";
import { portfolio_bio, profile } from "./portfolio.data";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { analytics_autocapture, analytics_capture } from "@/client/analytics/analytics";

export function AboutPage() {
  const bio = () => portfolio_bio();

  return (
    <Page class="max-w-[60ch]">
      <PageTitle>{profile.name}</PageTitle>
      <Facts.List>
        <Facts.Item label={m.fact_role()}>{bio().role}</Facts.Item>
        <Facts.Item label={m.fact_based()}>{bio().location}</Facts.Item>
        <Facts.Item label={m.fact_time()}>
          <LocalTime utcOffset={profile.utcOffset} />
        </Facts.Item>
        <Facts.Item label={m.fact_mail()}>
          <a
            href={`mailto:${profile.email}`}
            onClick={() =>
              analytics_capture("contact_clicked", { locale: getLocale(), placement: "about" })
            }
          >
            {profile.email}
          </a>
        </Facts.Item>
      </Facts.List>
      <Paragraphs items={bio().about} />
      <p class="m-0">
        {m.about_writing_intro()}{" "}
        <Link
          to="/writing"
          {...analytics_autocapture({
            id: "nav-link",
            destination: "/writing",
            placement: "about",
          })}
        >
          {m.about_writing_thoughts()}
        </Link>{" "}
        {m.about_writing_and()}{" "}
        <Link
          to="/writing/$slug"
          params={{ slug: "log-001-enough-to-start" }}
          {...analytics_autocapture({
            id: "article-link",
            article_slug: "log-001-enough-to-start",
            placement: "about",
          })}
        >
          {m.about_writing_portfolio()}
        </Link>
      </p>
      <p class="m-0">
        {m.about_more()}{" "}
        <Link
          to="/work"
          {...analytics_autocapture({ id: "nav-link", destination: "/work", placement: "about" })}
        >
          {m.nav_work()}
        </Link>{" "}
        {m.about_more_and()}{" "}
        <Link
          to="/projects"
          {...analytics_autocapture({
            id: "nav-link",
            destination: "/projects",
            placement: "about",
          })}
        >
          {m.nav_projects()}
        </Link>
      </p>
      <ProfileLinks />
    </Page>
  );
}

function ProfileLinks() {
  const [github, linkedin, x, instagram] = profile.links;

  return (
    <ul aria-label={m.about_find()} class="m-0 flex flex-wrap gap-2 p-0 list-none">
      <ProfileLink link={github}>
        <IconBrandGithub size={18} aria-hidden="true" />
      </ProfileLink>
      <ProfileLink link={linkedin}>
        <IconBrandLinkedin size={18} aria-hidden="true" />
      </ProfileLink>
      <ProfileLink link={x}>
        <IconBrandX size={18} aria-hidden="true" />
      </ProfileLink>
      <ProfileLink link={instagram}>
        <IconBrandInstagram size={18} aria-hidden="true" />
      </ProfileLink>
    </ul>
  );
}

function ProfileLink(props: ParentProps<{ link: (typeof profile.links)[number] }>) {
  return (
    <li>
      <Tooltip label={props.link.label}>
        {(triggerProps) => (
          <IconLink
            {...triggerProps({
              onClick: () =>
                analytics_capture("profile_link_clicked", {
                  locale: getLocale(),
                  platform: props.link.platform,
                  placement: "about",
                }),
            })}
            href={props.link.href}
            {...links_openInNewTab}
            aria-label={props.link.label}
          >
            {props.children}
          </IconLink>
        )}
      </Tooltip>
    </li>
  );
}
