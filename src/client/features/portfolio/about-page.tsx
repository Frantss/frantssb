import { Link } from "@tanstack/solid-router";
import type { ParentProps } from "solid-js";
import { mergeProps } from "@zag-js/solid";
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
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";
import { analytics_autocapture, analytics_capture } from "@/client/analytics/analytics";

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
          <a
            href={`mailto:${profile.email}`}
            onClick={() =>
              analytics_capture("contact_clicked", { locale: locale(), placement: "about" })
            }
          >
            {profile.email}
          </a>
        </Facts.Item>
      </Facts.List>
      <Paragraphs items={bio().about} />
      <p class="m-0">
        {m.about_more({}, { locale: locale() })}{" "}
        <Link
          to="/work"
          {...analytics_autocapture({ id: "nav-link", destination: "/work", placement: "about" })}
        >
          {m.nav_work({}, { locale: locale() })}
        </Link>
        ,{" "}
        <Link
          to="/projects"
          {...analytics_autocapture({
            id: "nav-link",
            destination: "/projects",
            placement: "about",
          })}
        >
          {m.nav_projects({}, { locale: locale() })}
        </Link>
        .
      </p>
      <ProfileLinks />
    </Page>
  );
}

function ProfileLinks() {
  const locale = useLocale();
  const [github, linkedin, x, instagram] = profile.links;
  return (
    <ul
      aria-label={m.about_find({}, { locale: locale() })}
      class="m-0 flex flex-wrap gap-2 p-0 list-none"
    >
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
  const locale = useLocale();
  return (
    <li>
      <Tooltip label={props.link.label}>
        {(triggerProps) => (
          <IconLink
            {...mergeProps(triggerProps, {
              onClick: () =>
                analytics_capture("profile_link_clicked", {
                  locale: locale(),
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
